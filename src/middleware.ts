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

    if (debugMode) {
        console.log(`Middleware [${requestId}]: Processing request for ${request.nextUrl.pathname}`);
        console.log(`Middleware [${requestId}]: Auth cookie present: ${isAuthenticated}, value: ${authCookieValue}`);
        console.log(`Middleware [${requestId}]: User role from cookie: ${userRole || 'not set'}`);
    }

    // Fallback to querying all cookies if direct get fails (for debugging)
    if (!userRole) {
        const allCookies = request.cookies.getAll();
        console.log(`Middleware [${requestId}]: No direct role cookie, checking all cookies:`,
            allCookies.map(c => `${c.name}=${c.value}`).join(', '));

        const roleCookie = allCookies.find(c => c.name === 'user_role');
        if (roleCookie) {
            userRole = roleCookie.value;
            console.log(`Middleware [${requestId}]: Found role in all cookies: ${userRole}`);
        }
    }

    // Check for special parameters that affect middleware behavior
    const url = request.nextUrl;
    const forceLogin = url.searchParams.get('force') === 'true' || url.searchParams.has('force');
    const unauthorizedAttempt = url.searchParams.get('unauthorized') === 'true';

    // Check if the user is accessing a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/employee') ||
        request.nextUrl.pathname.startsWith('/department');

    // Check if the user is accessing auth routes
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register') ||
        request.nextUrl.pathname.startsWith('/forgot-password');

    // Extract all cookies for debugging
    const allCookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
        allCookies[cookie.name] = cookie.value;
    });

    // Log the current state for debugging - only if debug mode is enabled
    if (debugMode) {
        console.log('Middleware state:', {
            path: request.nextUrl.pathname,
            isProtectedRoute,
            isAuthRoute,
            isAuthenticated,
            authCookieValue,
            hasValidAuth,
            forceLogin,
            userRole,
            cookies: allCookies
        });
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (isProtectedRoute && !hasValidAuth) {
        console.log(`Middleware [${requestId}]: Redirecting to login - not authenticated for protected route`);

        // Check for parameters that indicate we should bypass middleware
        const forceReload = request.nextUrl.searchParams.get('forceReload') === 'true';
        const bypassAuth = request.nextUrl.searchParams.get('bypass_auth') === 'true';
        const isFresh = request.nextUrl.searchParams.has('fresh');

        if (forceReload || bypassAuth || isFresh) {
            console.log(`Middleware [${requestId}]: Special parameter detected, bypassing redirect`);
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
        console.log(`Middleware [${requestId}]: User already logged in, redirecting based on role:`, userRole);

        // Try to get user role from headers as a backup
        const headerRole = request.headers.get('x-user-role');
        if (!userRole && headerRole) {
            userRole = headerRole;
            console.log(`Middleware [${requestId}]: Found role in header: ${userRole}`);
        }

        // If still no role, check for login type in query params
        const loginType = url.searchParams.get('type');
        if (!userRole && loginType && ['admin', 'department', 'employee'].includes(loginType)) {
            userRole = loginType;
            console.log(`Middleware [${requestId}]: Using login type as role: ${userRole}`);
        }

        if (!userRole) {
            console.warn(`Middleware [${requestId}]: No role found for authenticated user! Using default role.`);
            // Still redirect to a safe default
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
                console.log(`Middleware [${requestId}]: Redirecting to original location:`, from);
                const redirectUrl = new URL(`${from}`, request.url);
                redirectUrl.searchParams.set('redirected', 'true');
                redirectUrl.searchParams.set('ts', Date.now().toString());
                return NextResponse.redirect(redirectUrl);
            } else {
                console.log(`Middleware [${requestId}]: User ${normalizedRole} cannot access ${fromRole} area, redirecting to appropriate dashboard`);
            }
        }

        // Otherwise use role-based defaults with timestamp to prevent caching
        const timestamp = Date.now();
        const baseRedirect = new URL(`/${normalizedRole}/dashboard`, request.url);
        baseRedirect.searchParams.set('redirected', 'true');
        baseRedirect.searchParams.set('ts', timestamp.toString());

        // Add debug info if requested
        if (debugMode) {
            baseRedirect.searchParams.set('debug', 'true');
        }

        console.log(`Middleware [${requestId}]: Redirecting ${normalizedRole} to dashboard:`, baseRedirect.pathname);
        return NextResponse.redirect(baseRedirect);
    }

    // For protected routes with valid auth, check if the user has access to the specific role area
    if (isProtectedRoute && hasValidAuth) {
        const pathRole = request.nextUrl.pathname.split('/')[1]; // Extract role from path
        const normalizedUserRole = (userRole || '').toLowerCase();

        console.log(`Middleware [${requestId}]: Checking access - User role: ${normalizedUserRole}, Path role: ${pathRole}`);

        // Strict role-based access control with proper hierarchy
        let hasAccess = false;

        if (pathRole === 'admin') {
            // Only admins can access admin area
            hasAccess = normalizedUserRole === 'admin';
        } else if (pathRole === 'department') {
            // Only department managers can access department area
            // Admins should use admin area, not department area
            hasAccess = normalizedUserRole === 'department';
        } else if (pathRole === 'employee') {
            // Only employees can access employee area
            // Department managers and admins should use their respective areas
            hasAccess = normalizedUserRole === 'employee';
        }

        if (!hasAccess) {
            console.log(`Middleware [${requestId}]: Access DENIED - User with role "${normalizedUserRole}" attempted to access "${pathRole}" area`);
            // Redirect to their appropriate dashboard with unauthorized flag
            const appropriateRole = normalizedUserRole || 'employee';
            const redirectUrl = new URL(`/${appropriateRole}/dashboard?unauthorized=true&attempted=${pathRole}`, request.url);
            return NextResponse.redirect(redirectUrl);
        }

        console.log(`Middleware [${requestId}]: Access GRANTED to ${pathRole} area for user with role ${normalizedUserRole}`);
    }

    // Minimal logging for proceeding requests  
    if (debugMode) {
        console.log(`Middleware [${requestId}]: Allowing request to proceed`);
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

        // Auth routes that should be inaccessible if logged in
        '/login',
        '/register',
        '/forgot-password'
    ],
};