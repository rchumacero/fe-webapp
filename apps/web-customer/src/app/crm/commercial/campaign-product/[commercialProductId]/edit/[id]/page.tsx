import CampaignProductFormPage from "@/modules/crm/commercial/campaign-product/presentation/pages/CampaignProductFormPage";

export default async function Page({ params }: { params: Promise<{ commercialProductId: string, id: string }> }) {
  const { commercialProductId, id } = await params;
  return <CampaignProductFormPage id={id} commercialProductId={commercialProductId} />;
}
