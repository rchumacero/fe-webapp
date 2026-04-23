export const runtime = 'edge';
import PersonFormPage from "@/modules/crm/personal-data/person/presentation/pages/PersonFormPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonFormPage id={id} />;
}
