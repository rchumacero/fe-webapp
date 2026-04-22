import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // We can add role-based authorization here if needed
    // e.g. checking req.nextauth.token?.roles
    return NextResponse.next();
  },
  {
    pages: {
      // Redirect to our custom auto-login page, not the default next-auth page
      signIn: "/login",
    },
  }
);

export const config = {
  // Exclude auth endpoints, static files, and our custom login page from protection
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
};
