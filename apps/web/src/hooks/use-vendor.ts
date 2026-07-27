import { useSession } from "next-auth/react";

/**
 * Returns the logged-in user's CRM personId ("vendor") and name.
 * Automatically becomes `null` when the session expires or the user signs out.
 */
export function useVendor(): { vendor: string | null; vendorName: string | null; vendorCode: string | null } {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session) {
    if (status !== "loading") console.warn("useVendor: Not authenticated or no session", { status });
    return { vendor: null, vendorName: null, vendorCode: null };
  }

  const vendor = (session as any).vendor ?? null;
  const vendorName = (session as any).vendorName ?? null;
  const vendorCode = (session as any).vendorCode ?? (session as any).user?.username ?? (session as any).user?.email ?? null;

  if (!vendor) {
    console.error("useVendor: Session found but VENDOR field is missing!", session);
  }

  return { vendor, vendorName, vendorCode };
}
