import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Validates that a redirect target is strictly an internal, relative path.
 * Neutralizes Open Redirect attacks (CWE-601) via protocol-relative schemes,
 * backslash evasions (/\evil.com), URL-encoded tricks (/%2f%2f), or external hosts.
 */
export function getSafeRedirectPath(rawPath: string | null | undefined, fallback = '/dashboard'): string {
  if (!rawPath || typeof rawPath !== 'string') {
    return fallback;
  }

  const trimmed = rawPath.trim();

  // Must begin with a single slash and not a double slash or backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return fallback;
  }

  // Detect encoded evasions like /%2f, /%5c, etc.
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.startsWith('\\')) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  // Parse against trusted dummy internal origin to ensure host and protocol cannot be hijacked
  try {
    const dummyOrigin = 'https://internal.local';
    const parsed = new URL(trimmed, dummyOrigin);
    if (parsed.origin !== dummyOrigin || parsed.protocol !== 'https:') {
      return fallback;
    }
    // Return relative path + search + hash only
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate and sanitize "next" parameter strictly
  const next = getSafeRedirectPath(searchParams.get('next'), '/dashboard')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
