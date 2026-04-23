import NextAuth from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER || "https://api-dev-local.kplian.com",
      clientId: process.env.ZITADEL_CLIENT_ID || "",
      clientSecret: process.env.ZITADEL_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "openid email profile offline_access urn:zitadel:iam:org:project:id:zitadel:aud" },
      },
      async profile(profile, tokens) {
        try {
          const res = await fetch(`${process.env.ZITADEL_ISSUER}/oidc/v1/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          });
          if (res.ok) {
            const fullProfile = await res.json();
            return {
              id: fullProfile.sub,
              name: fullProfile.name || fullProfile.preferred_username || fullProfile.email || "Zitadel User",
              email: fullProfile.email,
              image: fullProfile.picture,
              username: fullProfile.preferred_username,
            };
          }
        } catch (e) {
          console.error("Manual userinfo fetch failed", e);
        }

        return {
          id: profile.sub,
          name: profile.name || (profile as any).preferred_username || "User",
          email: profile.email,
          image: profile.picture,
          username: (profile as any).preferred_username,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
  callbacks: {
    async signIn({ user, account, profile }) {
      const userCode = (user as any).username || (profile as any)?.preferred_username;
      if (account?.provider === 'zitadel' && userCode) {
        const crmApiUrl = process.env.API_GATEWAY_URL || 'https://dev-api.kplian.com';
        const token = account.access_token;

        try {
          const checkUrl = `${crmApiUrl}/crm/api/v1/persons/by-code/${userCode}`;
          const checkRes = await fetch(checkUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const checkText = await checkRes.text();
          if (checkRes.status === 404 || (checkRes.ok && checkText.length === 0)) {
            const zitadelProfile = profile as any;
            const nameParts = (user.name || '').split(' ');

            const createBody = {
              code: userCode,
              vendorCode: userCode,
              name1: zitadelProfile?.given_name || nameParts[0] || 'Unknown',
              name2: nameParts.length > 2 ? nameParts[1] : '',
              name3: '',
              surname1: zitadelProfile?.family_name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Unknown'),
              surname2: '',
              surname3: '',
              birthdate: zitadelProfile?.birthdate || "2024-01-01T00:00:00.000Z",
              gender: zitadelProfile?.gender || null,
              type: 'nat',
              cityOrigin: null,
              completeName: user.name || userCode
            };

            await fetch(`${crmApiUrl}/crm/api/v1/persons`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(createBody)
            });
          }
        } catch (error) {
          console.error("NextAuth: Error during JIT provisioning:", error);
        }
      }
      return true;
    },
    async jwt({ token, profile, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (user) {
        token.username = (user as any).username;
        token.roles = (user as any).roles || [];
      }
      if (profile) {
        const zitadelRoles = (profile as any)["urn:zitadel:iam:org:project:roles"] || {};
        token.roles = Object.keys(zitadelRoles);
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub as string,
        name: token.name as string,
        email: token.email as string,
        username: token.username as string,
        roles: token.roles as string[],
      } as any;
      (session as any).accessToken = token.accessToken;
      (session as any).idToken = token.idToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
