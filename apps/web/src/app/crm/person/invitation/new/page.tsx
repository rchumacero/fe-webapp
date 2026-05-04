import InvitationFormPage from "@/modules/crm/personal-data/invitation/presentation/pages/InvitationFormPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ personId?: string }> }) {
  const { personId } = await searchParams;
  return <InvitationFormPage personId={personId} />;
}
