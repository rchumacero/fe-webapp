import CampaignFormPage from "@/modules/crm/commercial/campaign/presentation/pages/CampaignFormPage";


interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <CampaignFormPage id={params.id} />;
}
