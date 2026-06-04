import FieldFormPage from "@/modules/workflow/fields/presentation/pages/FieldFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <FieldFormPage id={id} />;
}
