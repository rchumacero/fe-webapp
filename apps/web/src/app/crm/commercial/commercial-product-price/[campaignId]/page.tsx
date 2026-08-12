import { Suspense } from "react";
import CommercialProductPriceListPage from "@/modules/crm/commercial/commercial-product-price/presentation/pages/CommercialProductPriceListPage";

interface PageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { campaignId } = await params;
  return (
    <Suspense fallback={<div>Loading pricing...</div>}>
      <CommercialProductPriceListPage campaignId={campaignId} />
    </Suspense>
  );
}
