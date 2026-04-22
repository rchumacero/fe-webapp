import NextAuth from "next-auth";
import Zitadel from "next-auth/providers/zitadel";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const { handlers } = NextAuth({
  providers: [
    Zitadel({
      issuer: process.env.ZITADEL_ISSUER || "https://api-dev-local.kplian.com",
      clientId: process.env.ZITADEL_CLIENT_ID || "",
      clientSecret: process.env.ZITADEL_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) token.accessToken = account.access_token;
      if (user) token.username = (user as any).username;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const { GET, POST } = handlers;
