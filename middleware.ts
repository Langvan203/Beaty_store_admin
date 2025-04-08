import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  // Define paths that are considered public (don't need authentication)
  const isPublicPath = path === "/admin/login"

  // Check if the path is exactly /admin (root admin path)
  const isAdminRoot = path === "/admin" || path === "/admin/"

  // Check if the user is authenticated
  // In a real application, you would verify the token or session
  // For demo purposes, we'll use a simple cookie check
  const isAuthenticated = request.cookies.has("adminAuthenticated")

  // If the user is not authenticated and the path is not public, redirect to login
  if (!isAuthenticated && !isPublicPath && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // If the user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/","/admin", "/admin/:path*"],
}

