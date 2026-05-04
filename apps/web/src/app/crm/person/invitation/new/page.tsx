import InvitationFormPage from "@/modules/crm/personal-data/invitation/presentation/pages/InvitationFormPage";

export const runtime = 'edge';

export default async function Page({ searchParams }: { searchParams: Promise<{ personId?: string }> }) {
  const { personId } = await searchParams;
  return <InvitationFormPage personId={personId} />;
}
