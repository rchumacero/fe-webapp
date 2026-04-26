"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Check, Loader2, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function VendorSelectorModal() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);

  const relatedVendors = (session as any)?.relatedVendors || [];
  const currentVendor = (session as any)?.vendor;

  // Listen for manual trigger (from Header)
  useEffect(() => {
    const handleOpen = () => {
      setSelectedId(currentVendor);
      setOpen(true);
    };
    window.addEventListener('open-vendor-selector', handleOpen);
    return () => window.removeEventListener('open-vendor-selector', handleOpen);
  }, [currentVendor]);

  if (relatedVendors.length <= 1) return null;

  const handleSelectClick = () => {
    // If it's the same vendor, just mark as selected for this session and close
    if (selectedId === currentVendor) {
      sessionStorage.setItem('vendor_selected', 'true');
      setOpen(false);
      return;
    }
    // If changing vendor, show reload warning
    setShowReloadConfirm(true);
  };

  const confirmAndReload = async () => {
    if (selectedId) {
      setIsUpdating(true);
      try {
        const selectedVendor = relatedVendors.find((v: any) => v.id === selectedId);
        await update({ 
          vendor: selectedId,
          vendorName: selectedVendor?.name 
        });
        sessionStorage.setItem('vendor_selected', 'true');
        
        // Redirect to home and reload
        window.location.href = '/';
      } catch (error) {
        console.error("Error updating vendor:", error);
        setIsUpdating(false);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="text-primary" />
              Select Working Vendor
            </DialogTitle>
            <DialogDescription>
              You are related to multiple vendors. Please select which one you want to work as for this session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
            {relatedVendors.map((v: any) => (
              <button
                key={v.id}
                disabled={isUpdating}
                onClick={() => setSelectedId(v.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group",
                  selectedId === v.id 
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                    : "bg-card/50 border-border/40 hover:border-primary/40 hover:bg-primary/5",
                  isUpdating && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
                    selectedId === v.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                  )}>
                    {v.isSelf ? <User size={18} /> : (v.name ? v.name.charAt(0).toUpperCase() : '?')}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm line-clamp-1">
                      {v.name} {v.isSelf && <span className="text-[10px] ml-1 opacity-60 font-normal italic">(Me)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {v.isSelf ? 'Personal Account' : `ID: ${v.id.split('-')[0]}`}
                    </p>
                  </div>
                </div>
                {selectedId === v.id && <Check className="text-primary" size={18} />}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSelectClick} 
              disabled={!selectedId || isUpdating}
              className="w-full font-bold uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-primary/20"
            >
              {isUpdating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showReloadConfirm}
        onOpenChange={setShowReloadConfirm}
        title="Confirm Identity Change?"
        description="Changing your working identity will cause the application to reload and redirect you to the home page to ensure all data is consistent. Do you want to proceed?"
        confirmText="Yes, Change and Reload"
        cancelText="No, Keep Current"
        onConfirm={confirmAndReload}
        type="warning"
      />
    </>
  );
}
