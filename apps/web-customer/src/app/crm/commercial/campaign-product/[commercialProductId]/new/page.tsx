import CampaignProductFormPage from "@/modules/crm/commercial/campaign-product/presentation/pages/CampaignProductFormPage";

export default async function Page({ params }: { params: Promise<{ commercialProductId: string }> }) {
  const { commercialProductId } = await params;
  return <CampaignProductFormPage commercialProductId={commercialProductId} />;
}
