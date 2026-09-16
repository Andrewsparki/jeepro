import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/friends') ||
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

  // Fast-path: completely bypass expensive Supabase network round-trips for public marketing routes.
  // Server-side security is strictly enforced on all protected and authentication routes.
  if (!isProtectedRoute && !isAuthRoute && !isAuthCallback && !isAdminRoute && !isMaintenancePage) {
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
      // The admin layout will also call forbidden() as a second layer of defense
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin user — allow through
    return supabaseResponse
  }

  // ── Maintenance Mode Check ──────────────────────────────────────────
  // Check maintenance mode for protected routes (dashboard) only
  if (isProtectedRoute && user) {
    // Check if user is admin — admins bypass maintenance mode
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const userIsAdmin = profile?.is_admin === true

    if (!userIsAdmin) {
      // Check maintenance mode from system_settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single()

      const maintenanceEnabled = settings?.value?.enabled === true

      if (maintenanceEnabled) {
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
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    const maintenanceEnabled = settings?.value?.enabled === true

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
