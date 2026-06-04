import FormFormPage from "@/modules/workflow/forms/presentation/pages/FormFormPage";

interface PageProps {
  params: Promise<{
    processId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { processId } = await params;
  return <FormFormPage processId={processId} />;
}
