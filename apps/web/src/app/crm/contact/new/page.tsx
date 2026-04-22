import { ContactFormPage } from "@/modules/crm/personal-data/contact/presentation/pages/ContactFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ContactFormPage />
    </Suspense>
  );
}
