"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface AssistantMessageRendererProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

/**
 * Normalizes LaTeX delimiters so that both standard LaTeX delimiters
 * (\[ ... \], \( ... \)) and dollar delimiters ($$ ... $$, $ ... $)
 * are uniformly recognized by remark-math.
 */
function normalizeMathDelimiters(raw: string): string {
  if (!raw) return "";

  // Normalize \[ ... \] to $$ ... $$
  let text = raw.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n$$\n${math.trim()}\n$$\n`);
  
  // Normalize \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);

  return text;
}

export const AssistantMessageRenderer = React.memo(function AssistantMessageRenderer({
  content,
  className,
  isFullscreen = false,
}: AssistantMessageRendererProps) {
  const processedContent = useMemo(() => normalizeMathDelimiters(content), [content]);

  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        "assistant-markdown font-sans text-[#F5F7FB] selection:bg-[#78A9FF]/30 subpixel-antialiased",
        isFullscreen
          ? "text-[16.5px] sm:text-[17px] leading-[1.75] tracking-[-0.01em]"
          : "text-[14.5px] sm:text-[15px] leading-[1.65] tracking-[-0.005em]",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              output: "htmlAndMathml",
              throwOnError: false,
              strict: false,
            },
          ],
        ]}
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                "font-bold text-foreground tracking-tight border-b border-[#2B3342]/60 text-[#78A9FF] first:mt-0",
                isFullscreen
                  ? "text-xl sm:text-2xl mt-6 mb-3 pb-1.5"
                  : "text-lg mt-4 mb-2 pb-1"
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "font-semibold text-foreground tracking-tight text-[#94BCFF] first:mt-0",
                isFullscreen
                  ? "text-lg sm:text-xl mt-5 mb-2.5"
                  : "text-base mt-3.5 mb-1.5"
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                "font-semibold text-foreground text-[#BACDFE] first:mt-0",
                isFullscreen
                  ? "text-base sm:text-lg mt-4 mb-2"
                  : "text-sm mt-3 mb-1"
              )}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={cn(
                "first:mt-0 last:mb-0 text-[#E1E7F2]",
                isFullscreen ? "my-3.5 leading-[1.72]" : "my-2 leading-relaxed"
              )}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#BACDFE]/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                "ml-6 list-disc marker:text-[#78A9FF]/80 text-[#E1E7F2]",
                isFullscreen ? "my-3.5 space-y-2" : "my-2.5 space-y-1"
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                "ml-6 list-decimal marker:font-mono marker:text-[#78A9FF]/80 text-[#E1E7F2]",
                isFullscreen ? "my-3.5 space-y-2" : "my-2.5 space-y-1"
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn("pl-1", isFullscreen ? "leading-[1.72]" : "leading-relaxed")}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "border-l-3 border-[#78A9FF]/80 bg-[#161D2B]/70 rounded-r-xl italic text-[#BACDFE]",
                isFullscreen ? "my-4 pl-4 py-2.5 text-base" : "my-3 pl-3.5 py-1.5 text-sm"
              )}
            >
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className={cn(
                    "rounded-md bg-[#1B2232] font-mono font-medium text-[#78A9FF] border border-[#2B3342]/80",
                    isFullscreen ? "px-2 py-0.5 text-[14px]" : "px-1.5 py-0.5 text-[13px]"
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div
                className={cn(
                  "overflow-hidden rounded-xl border border-[#2B3342] bg-[#0E131E] shadow-sm",
                  isFullscreen ? "my-4" : "my-3"
                )}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#2B3342]/60 bg-[#141A28] text-[11px] font-mono text-[#A4ADBB]">
                  <span>{className?.replace("language-", "") || "code"}</span>
                </div>
                <div
                  className={cn(
                    "overflow-x-auto p-4 font-mono text-[#E1E7F2] custom-scrollbar",
                    isFullscreen ? "text-[13.5px] leading-relaxed" : "text-xs"
                  )}
                >
                  <code {...props}>{children}</code>
                </div>
              </div>
            );
          },
          table: ({ children }) => (
            <div
              className={cn(
                "w-full overflow-x-auto rounded-xl border border-[#2B3342] custom-scrollbar",
                isFullscreen ? "my-4 text-sm" : "my-3 text-xs"
              )}
            >
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#141A28] border-b border-[#2B3342] text-[#F5F7FB] font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#2B3342]/60 bg-[#0E131E]/50">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
          th: ({ children }) => (
            <th className={cn("font-medium", isFullscreen ? "px-4 py-2.5" : "px-3.5 py-2")}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn("text-[#E1E7F2]", isFullscreen ? "px-4 py-2.5" : "px-3.5 py-2")}>
              {children}
            </td>
          ),
          hr: () => <hr className="my-5 border-[#2B3342]/60" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#78A9FF] underline underline-offset-2 hover:text-[#94BCFF] transition-colors font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

AssistantMessageRenderer.displayName = "AssistantMessageRenderer";
