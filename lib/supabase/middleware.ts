import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Short in-memory cache for maintenance mode setting (15 seconds TTL) to avoid DB roundtrips on every request
let maintenanceModeCache: { enabled: boolean; timestamp: number } | null = null
const CACHE_TTL_MS = 15000

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/groups') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/achievements')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  const isAuthCallback = pathname.startsWith('/api/auth')
  const isMaintenancePage = pathname === '/maintenance'
  const isSuspendedPage = pathname === '/suspended'

  // Fast-path 1: completely bypass expensive Supabase network round-trips for public marketing routes.
  if (!isProtectedRoute && !isAuthRoute && !isAuthCallback && !isAdminRoute && !isMaintenancePage && !isSuspendedPage) {
    return supabaseResponse
  }

  // Cookie pre-check: Check if request carries any Supabase session cookies
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  )

  // Fast-path 2: Unauthenticated visit to protected route without auth cookies -> instant 0ms redirect to login
  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // Fast-path 3: Unauthenticated visit to auth page (/login, /signup) without auth cookies -> instant 0ms render
  if (isAuthRoute && !hasAuthCookie) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate user server-side for protected and auth routes
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Platform Access Suspension Check ─────────────────────────────────
  if (user && !isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended, suspended_until, is_admin')
      .eq('id', user.id)
      .single()

    const isSuspended =
      profile?.is_suspended === true &&
      (!profile?.suspended_until || new Date(profile.suspended_until) > new Date()) &&
      !profile?.is_admin

    if (isSuspended && !isSuspendedPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/suspended'
      url.search = ''
      return NextResponse.redirect(url)
    }

    if (!isSuspended && isSuspendedPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // ── Admin Route Protection ──────────────────────────────────────────
  if (isAdminRoute) {
    if (!user) {
      // Redirect unauthenticated users to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }

    // Check admin status — query the profiles table for is_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Non-admin authenticated users get redirected to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin user — allow through
    return supabaseResponse
  }

  // Helper to check maintenance mode status with short TTL memory cache
  async function isMaintenanceActive(): Promise<boolean> {
    const now = Date.now()
    if (maintenanceModeCache && now - maintenanceModeCache.timestamp < CACHE_TTL_MS) {
      return maintenanceModeCache.enabled
    }

    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    const enabled = settings?.value?.enabled === true
    maintenanceModeCache = { enabled, timestamp: now }
    return enabled
  }

  // ── Maintenance Mode Check ──────────────────────────────────────────
  // Check maintenance mode for protected routes (dashboard) only
  if (isProtectedRoute && user) {
    const maintenanceEnabled = await isMaintenanceActive()

    // ONLY IF maintenance mode is enabled, check if user is admin to allow bypass
    if (maintenanceEnabled) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      const userIsAdmin = profile?.is_admin === true

      if (!userIsAdmin) {
        // Redirect normal users to the maintenance page
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }

  // ── Maintenance Page Access Control ─────────────────────────────────
  // If maintenance is NOT active, redirect away from the maintenance page
  if (isMaintenancePage) {
    const maintenanceEnabled = await isMaintenanceActive()

    if (!maintenanceEnabled) {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/dashboard' : '/'
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Maintenance is active — show maintenance page
    return supabaseResponse
  }

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated users to login page with preserved target
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // Redirect authenticated users away from auth pages to dashboard
    const rawNext = request.nextUrl.searchParams.get('next')
    const safeNext =
      rawNext &&
      rawNext.startsWith('/') &&
      !rawNext.startsWith('//') &&
      !rawNext.startsWith('/\\')
        ? rawNext
        : '/dashboard'
    const url = new URL(safeNext, request.nextUrl.origin)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

