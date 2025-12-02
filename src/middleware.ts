import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // For client-side authentication, use the auth cookie set by our app
    const isAuthenticated = request.cookies.has('auth');
    const authCookieValue = request.cookies.get('auth')?.value;
    const hasValidAuth = isAuthenticated && authCookieValue === 'true';

    // Get user role from cookie - check both formats for compatibility
    let userRole = request.cookies.get('user_role')?.value;

    // Debug info and request tracking
    const requestId = Math.random().toString(36).substring(2, 10);
    const debugMode = request.nextUrl.searchParams.get('debug') === 'true';

    if (!userRole) {
    }

    // Check for special parameters that affect middleware behavior
    const url = request.nextUrl;
    const forceLogin = url.searchParams.get('force') === 'true' || url.searchParams.has('force');
    const unauthorizedAttempt = url.searchParams.get('unauthorized') === 'true';

    // Check if the user is accessing a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/employee') ||
        request.nextUrl.pathname.startsWith('/department') ||
        request.nextUrl.pathname === '/dashboard'; // Add dashboard redirect

    // Check if the user is accessing auth routes
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register') ||
        request.nextUrl.pathname.startsWith('/forgot-password');

    // Extract all cookies for debugging
    const allCookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
        allCookies[cookie.name] = cookie.value;
    });

    if (isProtectedRoute && !hasValidAuth) {

        // Check for parameters that indicate we should bypass middleware
        const forceReload = request.nextUrl.searchParams.get('forceReload') === 'true';
        const bypassAuth = request.nextUrl.searchParams.get('bypass_auth') === 'true';
        const isFresh = request.nextUrl.searchParams.has('fresh');

        if (forceReload || bypassAuth || isFresh) {
            return NextResponse.next();
        }

        // Add a timestamp parameter to prevent caching issues
        const timestamp = Date.now();
        const loginUrl = new URL(`/login?from=${encodeURIComponent(request.nextUrl.pathname)}&ts=${timestamp}`, request.url);

        // Add debug parameter if already present
        if (debugMode) {
            loginUrl.searchParams.set('debug', 'true');
        }

        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth route, and it's NOT forced login,
    // then redirect based on user role.
    // Also check for the fallback parameter which means we're already handling a redirect
    const isFallback = url.searchParams.has('fallback');
    const isFresh = url.searchParams.has('fresh');

    // Don't redirect if we're in a fallback redirect or have fresh param (already redirecting)
    if (isAuthRoute && hasValidAuth && !forceLogin && !unauthorizedAttempt && !isFallback && !isFresh) {
        const headerRole = request.headers.get('x-user-role');
        if (!userRole && headerRole) {
            userRole = headerRole;
        }

        const loginType = url.searchParams.get('type');
        if (!userRole && loginType && ['admin', 'department', 'employee'].includes(loginType)) {
            userRole = loginType;
        }

        if (!userRole) {
            return NextResponse.redirect(new URL('/employee/dashboard?role_missing=true', request.url));
        }

        // Normalize role to lowercase to prevent case issues
        const normalizedRole = userRole.toLowerCase();

        // Use the "from" parameter if available and user has access to that area
        const from = url.searchParams.get('from');
        if (from && from.startsWith('/')) {
            const fromRole = from.split('/')[1]; // Extract role from from parameter

            // Check if user has access to the requested area
            let canAccessFrom = false;
            if (fromRole === 'admin') {
                canAccessFrom = normalizedRole === 'admin';
            } else if (fromRole === 'department') {
                canAccessFrom = normalizedRole === 'department';
            } else if (fromRole === 'employee') {
                canAccessFrom = normalizedRole === 'employee';
            }

            if (canAccessFrom) {
                const redirectUrl = new URL(`${from}`, request.url);
                redirectUrl.searchParams.set('redirected', 'true');
                redirectUrl.searchParams.set('ts', Date.now().toString());
                return NextResponse.redirect(redirectUrl);
            }
        }

        // Otherwise use role-based defaults with timestamp to prevent caching
        const timestamp = Date.now();
        // Special case: MANAGER redirects to /department/dashboard instead of /manager/dashboard
        const redirectPath = normalizedRole === 'manager' ? '/department/dashboard' : `/${normalizedRole}/dashboard`;
        const baseRedirect = new URL(redirectPath, request.url);
        baseRedirect.searchParams.set('redirected', 'true');
        baseRedirect.searchParams.set('ts', timestamp.toString());

        // Add debug info if requested
        if (debugMode) {
            baseRedirect.searchParams.set('debug', 'true');
        }

        return NextResponse.redirect(baseRedirect);
    }

    // For protected routes with valid auth, check if the user has access to the specific role area
    if (isProtectedRoute && hasValidAuth) {
        // Handle /dashboard redirect to role-specific dashboard
        if (request.nextUrl.pathname === '/dashboard') {
            const normalizedUserRole = (userRole || '').toLowerCase();
            const roleBasedDashboard = normalizedUserRole === 'manager' 
              ? '/department/dashboard'
              : `/${normalizedUserRole}/dashboard`;
            return NextResponse.redirect(new URL(roleBasedDashboard, request.url));
        }

        const pathRole = request.nextUrl.pathname.split('/')[1];
        const normalizedUserRole = (userRole || '').toLowerCase();

        // Strict role-based access control with proper hierarchy
        let hasAccess = false;

        if (pathRole === 'admin') {
            // Only admins can access admin area
            hasAccess = normalizedUserRole === 'admin';
        } else if (pathRole === 'department') {
            // Both 'manager' and 'department' roles can access department area
            hasAccess = normalizedUserRole === 'department' || normalizedUserRole === 'manager';
        } else if (pathRole === 'employee') {
            // Only employees can access employee area
            // Department managers and admins should use their respective areas
            hasAccess = normalizedUserRole === 'employee';
        }

        if (!hasAccess) {
            const appropriateRole = normalizedUserRole || 'employee';
            const redirectUrl = new URL(`/${appropriateRole}/dashboard?unauthorized=true&attempted=${pathRole}`, request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    const response = NextResponse.next();

    // Add debugging headers if in debug mode
    if (debugMode) {
        response.headers.set('x-middleware-cache', 'no-cache');
        response.headers.set('x-auth-status', hasValidAuth ? 'true' : 'false');
        response.headers.set('x-user-role', userRole || 'none');
        response.headers.set('x-request-id', requestId);
    }

    return response;
}

// Configure matcher for routes that should trigger this middleware
export const config = {
    matcher: [
        // Protected routes that require authentication
        '/admin/:path*',
        '/employee/:path*',
        '/department/:path*',
        '/dashboard', // Add dashboard to trigger role-based redirect

        // Auth routes that should be inaccessible if logged in
        '/login',
        '/register',
        '/forgot-password'
    ],
};