import { ContactFormPage } from "@/modules/crm/personal-data/contact/presentation/pages/ContactFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ContactFormPage params={params} />
    </Suspense>
  );
}
