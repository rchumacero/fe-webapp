import FormFormPage from "@/modules/workflow/forms/presentation/pages/FormFormPage";

interface Props {
  params: Promise<{ id: string, processId: string }>;
}

export default async function Page({ params }: Props) {
  const { id, processId } = await params;
  return <FormFormPage id={id} processId={processId} />;
}
