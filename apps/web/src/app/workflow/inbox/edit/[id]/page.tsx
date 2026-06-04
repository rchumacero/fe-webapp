import CaseFormPage from "@/modules/workflow/inbox/presentation/pages/CaseFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <CaseFormPage id={id} />;
}
