export const runtime = 'edge';
import PersonDetailLayout from "@/modules/crm/personal-data/person/presentation/pages/PersonDetailLayout";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PersonDetailLayout params={params} />;
}
