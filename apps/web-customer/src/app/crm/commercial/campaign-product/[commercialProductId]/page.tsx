import CampaignProductListPage from "@/modules/crm/commercial/campaign-product/presentation/pages/CampaignProductListPage";

export default async function Page({ params }: { params: Promise<{ commercialProductId: string }> }) {
  const { commercialProductId } = await params;
  return <CampaignProductListPage commercialProductId={commercialProductId} />;
}
