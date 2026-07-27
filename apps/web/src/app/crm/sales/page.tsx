"use client";

import SaleListPage from "@/modules/crm/sales/sale/presentation/pages/SaleListPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <SaleListPage />
    </Suspense>
  );
}
