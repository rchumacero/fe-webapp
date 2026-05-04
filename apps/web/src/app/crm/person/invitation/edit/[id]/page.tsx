import InvitationFormPage from "@/modules/crm/personal-data/invitation/presentation/pages/InvitationFormPage";

export const runtime = 'edge';

export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ personId?: string }> 
}) {
  const { id } = await params;
  const { personId } = await searchParams;
  return <InvitationFormPage id={id} personId={personId} />;
}
