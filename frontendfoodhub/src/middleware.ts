import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ['/dashboard'];

    // Check if the current path starts with any of the protected paths
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtectedPath && !token) {
        const loginUrl = new URL('/auth/login', request.url);
        // loginUrl.searchParams.set('from', pathname); // Optional: remember where to redirect back
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
