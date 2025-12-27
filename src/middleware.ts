import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Route access configuration
const routePermissions: Record<string, string[]> = {
  '/dashboard/volunteers': ['admin'],
  '/dashboard/settings': ['admin'],
  '/dashboard/donors': ['admin', 'volunteer'],
  '/dashboard/assignments': ['admin', 'volunteer'],
  '/dashboard': ['admin', 'volunteer', 'donor'],
  '/dashboard/requests': ['admin', 'volunteer', 'donor'],
  '/dashboard/map': ['admin', 'volunteer', 'donor'],
  '/dashboard/statistics': ['admin', 'volunteer', 'donor'],
  '/dashboard/profile': ['admin', 'volunteer', 'donor'],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Check if accessing dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    // Get user role using service role key (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let userRole = 'donor'; // Default role

    if (serviceRoleKey && supabaseUrl) {
      try {
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`,
          {
            headers: {
              "apikey": serviceRoleKey,
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
          }
        );
        const profiles = await profileResponse.json();
        userRole = profiles?.[0]?.role || 'donor';
      } catch (error) {
        console.error('Middleware: Error fetching role', error);
      }
    }

    // Check route permissions
    const matchedRoute = Object.keys(routePermissions)
      .sort((a, b) => b.length - a.length) // Sort by length (more specific first)
      .find((route) => pathname.startsWith(route));

    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute];
      if (!allowedRoles.includes(userRole)) {
        // Redirect to dashboard with message
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
  ],
};
