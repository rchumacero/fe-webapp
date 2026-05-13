"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { getSession } from "next-auth/react"
import { setTokenProvider, setGlobalErrorHandler, setVendorProvider, setLanguageProvider, setTimezoneProvider, unlockApi } from "@kplian/infrastructure"
import i18n from "@kplian/i18n"
import { toast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

import { signOut } from "next-auth/react"

let isLoggingOut = false;

// Register a global error handler to show toasts for API errors
setGlobalErrorHandler((message, code) => {
  if (code === '401') {
    if (!isLoggingOut) {
      isLoggingOut = true;
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', { 
        title: 'Sesión Expirada',
        duration: 5000 
      });
      setTimeout(() => {
        sessionStorage.removeItem('vendor_selected');
        signOut({ redirect: true, callbackUrl: '/login' });
      }, 1000);
    }
    return;
  }

  // Ignore locked API errors (they are already handled)
  if (message === 'API_LOCKED') return;

  toast.error(message, { 
    title: code ? `Error ${code}` : 'API Error',
    duration: 8000 // Keep errors visible a bit longer
  });
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // If we are on the login page, always unlock the API
    if (pathname === '/login') {
      isLoggingOut = false;
      unlockApi();
    }
  }, [pathname]);

  useEffect(() => {
    let cachedVendor: string | null = null;
    let cachedToken: string | null = null;
    let lastFetch = 0;

    const getOrFetchSession = async () => {
      const now = Date.now();
      // Cache session for 2 seconds to avoid spamming /api/auth/session during bursts
      if (now - lastFetch < 2000 && (cachedToken || cachedVendor)) {
        return { token: cachedToken, vendor: cachedVendor };
      }

      try {
        const session = await getSession();
        cachedToken = (session as any)?.accessToken || null;
        cachedVendor = (session as any)?.vendor || null;
        lastFetch = now;

        // If we got a token, make sure API is unlocked
        if (cachedToken) {
          isLoggingOut = false;
          unlockApi();
        }
      } catch (error) {
        console.error("AuthProvider: Failed to fetch session", error);
      }
      
      return { token: cachedToken, vendor: cachedVendor };
    };

    // Inject providers
    setTokenProvider(async () => {
      const { token } = await getOrFetchSession();
      return token;
    });

    setVendorProvider(async () => {
      const { vendor } = await getOrFetchSession();
      return vendor;
    });

    setLanguageProvider(() => i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null) || 'es');
    setTimezoneProvider(() => (typeof window !== 'undefined' ? localStorage.getItem('app-timezone') : null) || Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return <SessionProvider>{children}</SessionProvider>
}

