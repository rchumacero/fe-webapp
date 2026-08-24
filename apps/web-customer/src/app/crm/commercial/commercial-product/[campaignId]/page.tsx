import CommercialProductListPage from "@/modules/crm/commercial/commercial-product/presentation/pages/CommercialProductListPage";

interface PageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { campaignId } = await params;
  return <CommercialProductListPage campaignId={campaignId} />;
}
