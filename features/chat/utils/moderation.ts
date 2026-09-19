/**
 * Utility functions for checking and handling chat moderation restrictions.
 */

export function isModerationError(err: unknown): boolean {
  if (!err) return false;
  let msg = "";
  if (typeof err === "string") {
    msg = err;
  } else if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    msg = String(e.message || e.error || e.details || "");
  }
  if (!msg) return false;

  const lower = msg.toLowerCase();
  return (
    lower.includes("direct messaging restricted") ||
    lower.includes("direct messaging access has been restricted") ||
    lower.includes("restricted by an administrator") ||
    lower.includes("user_moderation_scopes") ||
    (lower.includes("restricted") && lower.includes("messaging")) ||
    (lower.includes("restriction") && lower.includes("messaging"))
  );
}

export function extractModerationReason(err: unknown): string | null {
  if (!err) return null;
  let msg = "";
  if (typeof err === "string") {
    msg = err;
  } else if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    msg = String(e.message || e.error || e.details || "");
  }
  if (!msg) return null;

  if (msg.includes("Direct Messaging Restricted:")) {
    const parts = msg.split("Direct Messaging Restricted:");
    const reason = parts[1]?.trim();
    return reason || null;
  }

  // If the message contains a colon format like "Restricted: <reason>"
  if (msg.toLowerCase().includes("restricted:") && msg.includes(":")) {
    const parts = msg.split(":");
    const reason = parts.slice(1).join(":").trim();
    if (reason && !reason.toLowerCase().includes("restricted by an administrator")) {
      return reason;
    }
  }

  return null;
}
