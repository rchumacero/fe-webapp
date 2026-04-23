export const runtime = 'edge';
import { EconomicActivityFormPage } from "@/modules/crm/personal-data/economic-activity/presentation/pages/EconomicActivityFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <EconomicActivityFormPage params={params} />
    </Suspense>
  );
}
