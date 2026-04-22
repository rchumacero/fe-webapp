"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { getSession } from "next-auth/react"
import { setTokenProvider, setGlobalErrorHandler } from "@kplian/infrastructure"
import { toast } from "@/hooks/use-toast"

// Register a global error handler to show toasts for API errors
setGlobalErrorHandler((message, code) => {
  toast.error(message, { 
    title: code ? `Error ${code}` : 'API Error',
    duration: 8000 // Keep errors visible a bit longer
  });
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inject the generic token provider into the shared API client
    setTokenProvider(async () => {
      const session = await getSession();
      return (session as any)?.accessToken || null;
    });
  }, []);

  return <SessionProvider>{children}</SessionProvider>
}
