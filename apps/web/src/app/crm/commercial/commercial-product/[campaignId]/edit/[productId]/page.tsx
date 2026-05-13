import CommercialProductFormPage from "@/modules/crm/commercial/commercial-product/presentation/pages/CommercialProductFormPage";

interface PageProps {
  params: Promise<{
    campaignId: string;
    productId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { campaignId, productId } = await params;
  return <CommercialProductFormPage id={productId} campaignId={campaignId} />;
}
