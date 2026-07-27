"use client";

import SaleFormPage from "@/modules/crm/sales/sale/presentation/pages/SaleFormPage";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <SaleFormPage id={id} />
    </Suspense>
  );
}
