"use client";

import { useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.replace(callbackUrl);
      return;
    }

    if (status === "unauthenticated") {
      let callbackUrl = searchParams.get("callbackUrl") || "/";
      
      // Try to find invitationId in multiple places
      const currentInvitationId = searchParams.get("invitationId") || 
                                 (callbackUrl.includes("invitationId=") ? new URLSearchParams(callbackUrl.split("?")[1]).get("invitationId") : null) ||
                                 (callbackUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]) ||
                                 (typeof window !== 'undefined' ? localStorage.getItem("invitation_id") : null);
      
      if (currentInvitationId) {
        console.log("Persisting invitationId:", currentInvitationId);
        
        // 1. Store in localStorage (The "State" the user suggested)
        localStorage.setItem("invitation_id", currentInvitationId);
        
        // 2. Store in document.cookie (More reliable for the server to pick up)
        document.cookie = `invitation_id=${currentInvitationId}; path=/; max-age=3600; SameSite=Lax`;
        
        // 3. Ensure it's in the callbackUrl so NextAuth puts it in authjs.callback-url cookie
        if (!callbackUrl.includes(currentInvitationId)) {
          const separator = callbackUrl.includes("?") ? "&" : "?";
          callbackUrl = `${callbackUrl}${separator}invitationId=${currentInvitationId}`;
        }
      }

      signIn("zitadel", { callbackUrl });
    }
  }, [status, router, searchParams]);

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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
