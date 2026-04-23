export const runtime = 'edge';
import { WorkExperienceFormPage } from "@/modules/crm/personal-data/work-experience/presentation/pages/WorkExperienceFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <WorkExperienceFormPage params={params} />
    </Suspense>
  );
}
