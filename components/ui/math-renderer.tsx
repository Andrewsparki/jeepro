"use client";

import React, { useMemo } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { cn } from "@/lib/utils";

interface MathRendererProps {
  content: string;
  className?: string;
}

interface TextToken {
  type: "text" | "inline-math" | "block-math";
  value: string;
}

/**
 * Parses content text containing $inline math$ and $$block math$$
 * and renders KaTeX mathematical expressions along with standard formatted text.
 */
export function MathRenderer({ content, className }: MathRendererProps) {
  const tokens = useMemo(() => {
    if (!content) return [];

    const result: TextToken[] = [];
    // Split by $$ first for block math using ES2017-compatible regex
    const blockParts = content.split(/\$\$([\s\S]*?)\$\$/g);

    for (let i = 0; i < blockParts.length; i++) {
      const part = blockParts[i];
      if (i % 2 === 1) {
        // odd indices are block math
        result.push({ type: "block-math", value: part.trim() });
      } else if (part) {
        // even indices are standard text or inline math
        const inlineParts = part.split(/\$(.*?)\$/g);
        for (let j = 0; j < inlineParts.length; j++) {
          const inlinePart = inlineParts[j];
          if (j % 2 === 1) {
            result.push({ type: "inline-math", value: inlinePart.trim() });
          } else if (inlinePart) {
            result.push({ type: "text", value: inlinePart });
          }
        }
      }
    }

    return result;
  }, [content]);

  if (!content) {
    return <span className="text-muted-foreground italic">No content</span>;
  }

  return (
    <div className={cn("prose dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap", className)}>
      {tokens.map((token, idx) => {
        if (token.type === "block-math") {
          return (
            <div key={idx} className="my-4 py-3 px-4 rounded-xl bg-surface/80 border border-glass-border flex justify-center text-lg overflow-x-auto">
              <BlockMath math={token.value} />
            </div>
          );
        }
        if (token.type === "inline-math") {
          return (
            <span key={idx} className="inline-block px-1 font-serif">
              <InlineMath math={token.value} />
            </span>
          );
        }
        return <span key={idx}>{token.value}</span>;
      })}
    </div>
  );
}
