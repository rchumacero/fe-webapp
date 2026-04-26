"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Check, Loader2, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function SelectVendorContent() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const relatedVendors = (session as any)?.relatedVendors || [];
  const currentVendor = (session as any)?.vendor;
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    // If authenticated and only one vendor or already selected, go back to callback
    if (status === 'authenticated') {
      if (relatedVendors.length <= 1) {
        router.replace(callbackUrl);
      } else if (sessionStorage.getItem('vendor_selected')) {
        router.replace(callbackUrl);
      }
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, relatedVendors, callbackUrl, router]);

  const handleSelect = async () => {
    if (selectedId) {
      setIsUpdating(true);
      try {
        const selectedVendor = relatedVendors.find((v: any) => v.id === selectedId);
        await update({ 
          vendor: selectedId,
          vendorName: selectedVendor?.name 
        });
        sessionStorage.setItem('vendor_selected', 'true');
        router.replace(callbackUrl);
      } catch (error) {
        console.error("Error updating vendor:", error);
        setIsUpdating(false);
      }
    }
  };

  if (status === 'loading' || relatedVendors.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e]">
        <Loader2 className="animate-spin text-primary size-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/10 mb-1">
            <Building2 className="text-primary size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Select Your Identity</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Choose the identity you want to act as for this session.
          </p>
        </div>

        {/* Vendor List */}
        <div className="space-y-3 mb-8">
          {relatedVendors.map((v: any) => (
            <button
              key={v.id}
              disabled={isUpdating}
              onClick={() => setSelectedId(v.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                selectedId === v.id 
                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                  : "bg-[#161d2f]/50 border-white/5 hover:border-primary/40 hover:bg-[#161d2f]",
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500",
                  selectedId === v.id 
                    ? "bg-primary text-white scale-105" 
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-primary"
                )}>
                  {v.isSelf ? <User size={18} /> : (v.name ? v.name.charAt(0).toUpperCase() : '?')}
                </div>
                <div className="text-left">
                  <p className={cn(
                    "font-bold text-sm transition-colors",
                    selectedId === v.id ? "text-white" : "text-slate-200 group-hover:text-white"
                  )}>
                    {v.name} {v.isSelf && <span className="text-[10px] ml-1 opacity-60 font-normal italic">(Me)</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    {v.isSelf ? 'Personal Account' : `ID: ${v.id.split('-')[0]}`}
                  </p>
                </div>
              </div>
              
              {selectedId === v.id && (
                <div className="bg-primary rounded-full p-1 relative z-10 animate-in zoom-in">
                  <Check className="text-white" size={14} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleSelect} 
          disabled={!selectedId || isUpdating}
          className="w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isUpdating ? (
            <Loader2 className="animate-spin mr-2" size={16} />
          ) : (
            <Check className="mr-2" size={16} />
          )}
          {isUpdating ? 'Synchronizing...' : 'Confirm Selection'}
        </Button>
        
        <p className="text-center text-slate-500 text-sm mt-8">
          Logged in as <span className="text-slate-300 font-medium">{(session?.user as any)?.username || session?.user?.email}</span>
        </p>
      </div>
    </div>
  );
}

export default function SelectVendorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e]">
        <Loader2 className="animate-spin text-primary size-12" />
      </div>
    }>
      <SelectVendorContent />
    </Suspense>
  );
}
