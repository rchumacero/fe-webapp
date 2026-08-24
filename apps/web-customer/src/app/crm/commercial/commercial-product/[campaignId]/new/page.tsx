import CommercialProductFormPage from "@/modules/crm/commercial/commercial-product/presentation/pages/CommercialProductFormPage";

interface PageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { campaignId } = await params;
  return <CommercialProductFormPage campaignId={campaignId} />;
}
