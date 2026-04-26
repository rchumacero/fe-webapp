"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { getSession } from "next-auth/react"
import { setTokenProvider, setGlobalErrorHandler, setVendorProvider } from "@kplian/infrastructure"
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
    let cachedVendor: string | null = null;
    let cachedToken: string | null = null;
    let lastFetch = 0;

    const getOrFetchSession = async () => {
      const now = Date.now();
      // Cache session for 5 seconds to avoid spamming /api/auth/session
      if (now - lastFetch < 5000 && (cachedToken || cachedVendor)) {
        return { token: cachedToken, vendor: cachedVendor };
      }

      const session = await getSession();
      cachedToken = (session as any)?.accessToken || null;
      cachedVendor = (session as any)?.vendor || null;
      lastFetch = now;
      return { token: cachedToken, vendor: cachedVendor };
    };

    // Inject the generic token provider into the shared API client
    setTokenProvider(async () => {
      const { token } = await getOrFetchSession();
      return token;
    });

    // Inject the vendor provider into the shared API client
    setVendorProvider(async () => {
      const { vendor } = await getOrFetchSession();
      return vendor;
    });
  }, []);

  return <SessionProvider>{children}</SessionProvider>
}

