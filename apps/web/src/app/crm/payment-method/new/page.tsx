import { PaymentMethodFormPage } from "@/modules/crm/personal-data/payment-method/presentation/pages/PaymentMethodFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <PaymentMethodFormPage />
    </Suspense>
  );
}
