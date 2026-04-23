export const runtime = 'edge';
import { PaymentMethodFormPage } from "@/modules/crm/personal-data/payment-method/presentation/pages/PaymentMethodFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PaymentMethodFormPage params={params} />
    </Suspense>
  );
}
