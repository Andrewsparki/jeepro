import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/supabase/server";
import { getGeminiClient, JEE_ASSISTANT_SYSTEM_INSTRUCTION } from "@/features/ai-assistant/services/gemini.service";
import { checkAiRateLimit } from "@/features/ai-assistant/services/ai-rate-limiter.service";

// Maximum length of a single prompt and bounded history turns to minimize token consumption
const MAX_PROMPT_LENGTH = 3000;
const MAX_HISTORY_MESSAGES = 6;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().default("").transform((val) => val.trim()),
});

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(MAX_PROMPT_LENGTH, "Prompt is too long"),
  history: z.array(chatMessageSchema).optional(),
  context: z
    .object({
      subject: z.string().optional().nullable(),
      chapter: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to use the AI Study Assistant." },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload: Please check that your question is valid." },
        { status: 400 }
      );
    }

    const { prompt, history = [], context } = parsed.data;

    // 3. Check server-side GEMINI_API_KEY
    let aiClient;
    try {
      aiClient = getGeminiClient();
    } catch {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured.",
          hint: "Set GEMINI_API_KEY in your server-side environment variables (.env.local) to enable the AI Study Assistant.",
        },
        { status: 503 }
      );
    }

    // 4. Enforce per-user rate limiting (10 requests per minute)
    const rateLimit = await checkAiRateLimit(user.id, 10, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You can send up to 10 questions per minute. Please wait a moment before sending another prompt.",
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt,
          },
        }
      );
    }

    // 5. Format conversation contents for Gemini SDK
    // Keep history strictly within recent turns to reduce token usage
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Append concise context metadata only if relevant
    let initialUserPrompt = prompt.trim();
    if (context?.subject || context?.chapter) {
      const parts = [
        context.subject?.trim() ? `Sub: ${context.subject.trim()}` : "",
        context.chapter?.trim() ? `Chap: ${context.chapter.trim()}` : "",
      ].filter(Boolean);
      if (parts.length > 0) {
        initialUserPrompt = `[${parts.join(" | ")}]\n${initialUserPrompt}`;
      }
    }

    // Keep up to MAX_HISTORY_MESSAGES non-empty turns
    const recentHistory = history
      .filter((m) => m.content && m.content.trim().length > 0)
      .slice(-MAX_HISTORY_MESSAGES);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      });
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: initialUserPrompt }],
    });

    // Detect if problem involves calculation / proof / derivation requiring step-by-step thinking
    const lowerPrompt = prompt.toLowerCase();
    const isComplexProblem =
      /\b(solve|calculate|derive|find|integrate|differentiate|evaluate|prove|mechanism|numerical|reaction|integral|matrix|vector|limit)\b/.test(
        lowerPrompt
      );

    // 5. Initiate streaming response from Gemini
    // Using gemini-3.6-flash: lower thinking budget for routine queries, higher budget for problem-solving
    const responseStream = await aiClient.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: JEE_ASSISTANT_SYSTEM_INSTRUCTION,
        temperature: 0.35,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: isComplexProblem ? 1024 : 0,
        },
      },
    });

    // 6. Pipe stream back to client using ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (streamError: any) {
          controller.error(streamError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": rateLimit.resetAt,
      },
    });
  } catch (err: any) {
    let rawMessage = err?.message || "";
    let status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;

    // Check if rawMessage is a JSON string from Google Gemini API
    if (typeof rawMessage === "string" && rawMessage.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rawMessage);
        if (parsed.error) {
          if (parsed.error.code) status = parsed.error.code;
          rawMessage = parsed.error.message || rawMessage;
        }
      } catch {
        // Fall back to original rawMessage
      }
    }

    const lower = rawMessage.toLowerCase();

    // Map common provider issues to clean, human-readable explanations
    let userFriendlyError = "Unable to generate AI response. Please try again later.";

    if (status === 429 || lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted")) {
      userFriendlyError = "Rate limit or quota exceeded. Please wait a moment before sending another prompt.";
      status = 429;
    } else if (status === 404 || lower.includes("not_found") || lower.includes("model")) {
      userFriendlyError = "The requested AI model is currently unavailable or unsupported. Please check the model configuration.";
      status = 404;
    } else if (status === 403 || status === 401 || lower.includes("api key") || lower.includes("unauthenticated") || lower.includes("permission_denied")) {
      userFriendlyError = "Authentication with Gemini API failed. Please verify your GEMINI_API_KEY in server environment variables.";
      status = 403;
    } else if (rawMessage && !rawMessage.startsWith("{") && !rawMessage.includes("at ")) {
      // Strip any file paths or stack references if present
      userFriendlyError = rawMessage.split("\n")[0].trim();
    }

    return NextResponse.json(
      { error: userFriendlyError },
      { status }
    );
  }
}
