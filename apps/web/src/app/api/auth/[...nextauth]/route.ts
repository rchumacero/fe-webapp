import NextAuth, { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

export const runtime = 'edge';

const authOptions: NextAuthOptions = {
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER as string || "https://api-dev-local.kplian.com",
      clientId: process.env.ZITADEL_CLIENT_ID as string || "",
      clientSecret: process.env.ZITADEL_CLIENT_SECRET as string || "",
      authorization: {
        params: { scope: "openid email profile offline_access urn:zitadel:iam:org:project:id:zitadel:aud" },
      },
      async profile(profile, tokens) {
        // Manually fetch userinfo if profile data seems incomplete
        // tokens.access_token should be available
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

        // Fallback to default profile object
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
      console.log("NextAuth: signIn callback triggered", { provider: account?.provider });

      const userCode = (user as any).username || (profile as any)?.preferred_username;
      if (account?.provider === 'zitadel' && userCode) {
        const crmApiUrl = process.env.API_GATEWAY_URL || 'https://dev-api.kplian.com';
        const token = account.access_token;

        console.log("NextAuth: Attempting JIT provisioning for", { userCode, apiUrl: crmApiUrl });

        try {
          // 1. Check if user exists
          const checkUrl = `${crmApiUrl}/crm/api/v1/persons/by-code/${userCode}`;
          const checkRes = await fetch(checkUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const checkText = await checkRes.text();
          console.log(`NextAuth: Check user response code: ${checkRes.status}. Content length: ${checkText.length}`);

          // API returns 200 with empty body if not found, or 404
          if (checkRes.status === 404 || (checkRes.ok && checkText.length === 0)) {
            console.log(`NextAuth: User ${userCode} not found in CRM, creating...`);

            // 2. Create user if not exists
            const zitadelProfile = profile as any;
            const nameParts = (user.name || '').split(' ');

            const createBody = {
              code: userCode,
              vendorCode: userCode, // Send zitadel user as vendorCode
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

            console.log("NextAuth: Creating person with body:", JSON.stringify(createBody));

            const createRes = await fetch(`${crmApiUrl}/crm/api/v1/persons`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(createBody)
            });

            if (!createRes.ok) {
              const errorText = await createRes.text();
              console.error(`NextAuth: Failed to create person. Status: ${createRes.status}, Error: ${errorText}`);
            } else {
              const result = await createRes.json();
              console.log(`NextAuth: Successfully created person ${userCode} in CRM`, result);
            }
          } else if (checkRes.ok) {
            console.log(`NextAuth: User ${userCode} already exists in CRM.`);
          } else {
            const errorText = await checkRes.text();
            console.warn(`NextAuth: Unexpected check response: ${checkRes.status}. Error: ${errorText}`);
          }
        } catch (error) {
          console.error("NextAuth: Error during JIT provisioning:", error);
        }
      } else {
        console.warn("NextAuth: JIT provisioning skipped. Missing provider or userCode", {
          provider: account?.provider,
          userCode
        });
      }
      return true;
    },
    async jwt({ token, profile, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }

      // Initial login
      if (user) {
        token.username = (user as any).username;
        token.name = user.name;
        token.email = user.email;
        token.roles = (user as any).roles || [];
      }

      // Zitadel specific claims from profile if present
      if (profile) {
        const zitadelRoles = (profile as any)["urn:zitadel:iam:org:project:roles"] || {};
        token.roles = Object.keys(zitadelRoles);
        if (!token.name) {
          token.name = (profile as any).name || (profile as any).preferred_username;
        }
        if (!token.username) {
          token.username = (profile as any).preferred_username;
        }
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
    signIn: '/login', // Custom auto-redirect login page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
