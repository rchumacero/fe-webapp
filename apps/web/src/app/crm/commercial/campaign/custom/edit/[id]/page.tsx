import CampaignFormPage from "@/modules/crm/commercial/campaign/presentation/pages/CampaignFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <CampaignFormPage id={id} mode="custom" />;
}
