"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Auto-redirect Login Page
 *
 * This page is the entry point for unauthenticated users.
 * Instead of showing a login form or button, it immediately
 * triggers the Zitadel OIDC flow as soon as it mounts.
 *
 * Flow:
 *  1. Middleware detects no session → redirects here.
 *  2. This page auto-calls signIn('zitadel') on mount.
 *  3. Browser is redirected to Zitadel for authentication.
 *  4. Zitadel redirects back to /api/auth/callback/zitadel.
 *  5. Next-Auth creates the session and sends user to callbackUrl (default: /).
 */
export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      // Already logged in — go to the requested page or home
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.replace(callbackUrl);
      return;
    }

    if (status === "unauthenticated") {
      // Auto-trigger Zitadel OIDC flow, no button needed
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      signIn("zitadel", { callbackUrl });
    }
  }, [status, router, searchParams]);

  // Minimal loading state while session is resolving or Zitadel is loading
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#0a0f1e",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid rgba(16, 185, 129, 0.2)",
          borderTopColor: "#10b981",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        Redirecting to login...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
