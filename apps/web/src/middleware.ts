import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  
  const search = req.nextUrl.search;
  const searchParams = req.nextUrl.searchParams;
  
  // Try to get invitationId from named param or direct UUID pattern (?UUID)
  let invitationId = searchParams.get('invitationId');
  if (!invitationId && search.startsWith('?') && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search.substring(1))) {
    invitationId = search.substring(1);
  }

  if (invitationId) {
    console.log('ESTE ES middleware - invitation detected:', invitationId);
  }

  let response = NextResponse.next();

  if (isLoginPage) {
    if (isAuth) {
      response = NextResponse.redirect(new URL("/", req.nextUrl));
    } else {
      response = NextResponse.next();
    }
  } else if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) from += req.nextUrl.search;

    response = NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }

  // Set invitation cookie if found in the URL
  if (invitationId) {
    response.cookies.set("invitation_id", invitationId, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });
  }

  return response;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
