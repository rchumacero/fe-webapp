import { EconomicActivityFormPage } from "@/modules/crm/personal-data/economic-activity/presentation/pages/EconomicActivityFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <EconomicActivityFormPage />
    </Suspense>
  );
}
