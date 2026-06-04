import FormListPage from "@/modules/workflow/forms/presentation/pages/FormListPage";

interface PageProps {
  params: Promise<{
    processId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { processId } = await params;
  return <FormListPage processId={processId} />;
}
