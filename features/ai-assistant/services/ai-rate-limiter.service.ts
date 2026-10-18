import { createClient } from "@/lib/supabase/server";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfterSeconds: number;
}

// In-memory sliding-window backup if database RPC is not yet registered
const memoryStore = new Map<string, { count: number; windowStart: number }>();
const MEMORY_WINDOW_MS = 60 * 1000;
const MEMORY_MAX_REQUESTS = 10;

function checkMemoryRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(userId);

  if (!entry || now - entry.windowStart >= MEMORY_WINDOW_MS) {
    memoryStore.set(userId, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MEMORY_MAX_REQUESTS - 1,
      resetAt: new Date(now + MEMORY_WINDOW_MS).toISOString(),
      retryAfterSeconds: 0,
    };
  }

  if (entry.count < MEMORY_MAX_REQUESTS) {
    entry.count += 1;
    return {
      allowed: true,
      remaining: MEMORY_MAX_REQUESTS - entry.count,
      resetAt: new Date(entry.windowStart + MEMORY_WINDOW_MS).toISOString(),
      retryAfterSeconds: 0,
    };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.windowStart + MEMORY_WINDOW_MS - now) / 1000));
  return {
    allowed: false,
    remaining: 0,
    resetAt: new Date(entry.windowStart + MEMORY_WINDOW_MS).toISOString(),
    retryAfterSeconds,
  };
}

/**
 * Checks and increments the per-user AI rate limit.
 * Uses atomic Postgres RPC 'check_and_increment_ai_rate_limit' with durable row-level locking.
 * Gracefully falls back to in-memory sliding window if database migration is pending.
 */
export async function checkAiRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("check_and_increment_ai_rate_limit", {
      p_user_id: userId,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (!error && data) {
      const result = typeof data === "string" ? JSON.parse(data) : data;
      return {
        allowed: Boolean(result.allowed),
        remaining: Number(result.remaining ?? 0),
        resetAt: String(result.reset_at || new Date(Date.now() + windowSeconds * 1000).toISOString()),
        retryAfterSeconds: Number(result.retry_after_seconds ?? 0),
      };
    }

    if (error) {
      // 42883 = function does not exist, 42P01 = table does not exist
      if (error.code !== "42883" && error.code !== "42P01") {
        console.warn("[AiRateLimiter] Database rate limit RPC returned error:", error.message);
      }
    }
  } catch (rpcErr) {
    console.warn("[AiRateLimiter] Failed to execute database rate limit, falling back to local window:", rpcErr);
  }

  // Fallback to in-memory sliding window
  return checkMemoryRateLimit(userId);
}
