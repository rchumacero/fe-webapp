import { IdentificationFormPage } from "@/modules/crm/personal-data/identification/presentation/pages/IdentificationFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <IdentificationFormPage />
    </Suspense>
  );
}
