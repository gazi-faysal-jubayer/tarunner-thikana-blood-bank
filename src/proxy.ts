import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./lib/better-auth/auth";

// Route access configuration
const routePermissions: Record<string, string[]> = {
  "/dashboard/volunteers": ["admin"],
  "/dashboard/settings": ["admin"],
  "/dashboard/donors": ["admin", "volunteer"],
  "/dashboard/assignments": ["admin", "volunteer"],
  "/dashboard": ["admin", "volunteer", "donor"],
  "/dashboard/requests": ["admin", "volunteer", "donor"],
  "/dashboard/map": ["admin", "volunteer", "donor"],
  "/dashboard/statistics": ["admin", "volunteer", "donor"],
  "/dashboard/profile": ["admin", "volunteer", "donor"],
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Check if accessing dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Redirect to login if not authenticated
    if (!session || !session.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = session.user.role || "donor";

    // Check route permissions
    const matchedRoute = Object.keys(routePermissions)
      .sort((a, b) => b.length - a.length) // Sort by length (more specific first)
      .find((route) => pathname.startsWith(route));

    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute];
      if (!allowedRoles.includes(userRole)) {
        // Redirect to dashboard with message
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
};
