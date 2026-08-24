import { auth } from "./auth";
import { NextResponse } from "next/server";

export default function middleware(request: any, ctx: any) {
  return auth((req) => {
  const isAuth = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  const search = req.nextUrl.search;
  const searchParams = req.nextUrl.searchParams;

  // Try to get invitationId from named param or direct UUID pattern (?UUID)
  let invitationId = searchParams.get('invitationId');
  if (!invitationId && search.startsWith('?') && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search.substring(1))) {
    invitationId = search.substring(1);
  }

  let response = NextResponse.next();

  if (isLoginPage && isAuth) {
    response = NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Set invitation cookie if found in the URL
  if (invitationId) {
    response.cookies.set("invitation_id", invitationId, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
  })(request, ctx);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
