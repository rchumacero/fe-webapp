export const runtime = 'edge';
import { PersonDigitalContentFormPage } from "@/modules/crm/personal-data/person-digital-content/presentation/pages/PersonDigitalContentFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PersonDigitalContentFormPage params={params} />
    </Suspense>
  );
}
