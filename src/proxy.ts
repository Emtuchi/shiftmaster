import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth.utils";
import prisma from "@/lib/prisma";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // No token
  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  try {
    // Get userId from token
    const { userId } = verifyToken(token);

    // Fetch CURRENT user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = user.role;

    // Redirect away from auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, req.url));
    }

    // RBAC
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/manager") && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/staff") && role !== "STAFF") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/staff/:path*",
  ],
};