export const runtime = 'edge';
import { IdentificationFormPage } from "@/modules/crm/personal-data/identification/presentation/pages/IdentificationFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <IdentificationFormPage params={params} />
    </Suspense>
  );
}
