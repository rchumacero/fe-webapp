import TaskFormPage from "@/modules/workflow/tasks/presentation/pages/TaskFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <TaskFormPage id={id} />;
}
