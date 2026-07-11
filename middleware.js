import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const AUTH_ROUTES = ["/login", "/register"];
const CUSTOMER_PREFIXES = ["/order", "/orders", "/profile"];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user);
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isAdminRoute = path.startsWith(ADMIN_PREFIX);
  const isCustomerRoute = CUSTOMER_PREFIXES.some((p) => path.startsWith(p));

  // Already authenticated users skip the auth pages.
  if (isAuthRoute && isLoggedIn) {
    const dest = role === "admin" ? "/admin/dashboard" : "/orders";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // Admin area requires the admin role.
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, nextUrl),
      );
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Customer-only areas require any authenticated session.
  if (isCustomerRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, nextUrl),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
