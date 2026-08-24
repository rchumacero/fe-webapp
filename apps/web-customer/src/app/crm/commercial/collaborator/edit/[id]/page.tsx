"use client";

import CollaboratorFormPage from "@/modules/crm/commercial/collaborator/presentation/pages/CollaboratorFormPage";
import { use } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <CollaboratorFormPage id={id} />
    </Suspense>
  );
}
