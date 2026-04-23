import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (isLoginPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) from += req.nextUrl.search;

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
};
