import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip middleware for API routes and static files
  if (
    req.nextUrl.pathname.startsWith("/api/") ||
    req.nextUrl.pathname.startsWith("/_next/") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if this is a preview environment
  const isPreview =
    req.headers.get("host")?.includes("v0.dev") ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development"

  // Only redirect if not in preview and trying to access protected routes
  if (!session && req.nextUrl.pathname.startsWith("/dashboard") && !isPreview) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
