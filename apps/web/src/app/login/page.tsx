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
      const callbackUrl = searchParams.get("callbackUrl") || "/";
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
