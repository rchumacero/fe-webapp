"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { VendorSelectorModal } from '../shared/VendorSelectorModal';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && isMounted) {
      const relatedVendors = (session as any)?.relatedVendors || [];
      const hasMultipleVendors = relatedVendors.length > 1;
      const hasSelected = sessionStorage.getItem('vendor_selected');

      // If they have multiple vendors but haven't selected one, and aren't already on the selection page
      if (hasMultipleVendors && !hasSelected && pathname !== '/select-vendor') {
        setIsRedirecting(true);
        router.replace(`/select-vendor?callbackUrl=${encodeURIComponent(pathname)}`);
      } else {
        setIsRedirecting(false);
      }
    }
  }, [status, session, pathname, router, isMounted]);

  // Handle loading/redirect states after mounting
  const isPendingSelection = isMounted && 
    status === 'authenticated' && 
    ((session as any)?.relatedVendors?.length > 1) && 
    !sessionStorage.getItem('vendor_selected') && 
    pathname !== '/select-vendor';

  if (!isMounted || status === 'loading' || isRedirecting || isPendingSelection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e]">
        <Loader2 className="animate-spin text-primary size-12" />
        <p className="text-slate-500 mt-4 animate-pulse">
          {!isMounted || status === 'loading' ? 'Loading system...' : 'Verifying identity context...'}
        </p>
      </div>
    );
  }

  const isPublicPage = pathname === '/login';

  if (isPublicPage) {
    return (
      <main className="min-h-screen bg-background">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <VendorSelectorModal />
      {/* Sidebar - Persistent left navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Top global actions */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-10 py-2">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
