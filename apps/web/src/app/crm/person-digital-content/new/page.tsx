import { PersonDigitalContentFormPage } from "@/modules/crm/personal-data/person-digital-content/presentation/pages/PersonDigitalContentFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <PersonDigitalContentFormPage />
    </Suspense>
  );
}
