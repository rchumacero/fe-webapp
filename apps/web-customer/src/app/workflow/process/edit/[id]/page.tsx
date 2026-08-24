import ProcessFormPage from "@/modules/workflow/process/presentation/pages/ProcessFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ProcessFormPage id={id} />;
}
