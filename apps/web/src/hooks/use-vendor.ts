import { useSession } from "next-auth/react";

/**
 * Returns the logged-in user's CRM personId ("vendor") and name.
 * Automatically becomes `null` when the session expires or the user signs out.
 */
export function useVendor(): { vendor: string | null; vendorName: string | null } {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session) return { vendor: null, vendorName: null };

  return {
    vendor: (session as any).vendor ?? null,
    vendorName: (session as any).vendorName ?? null,
  };
}
