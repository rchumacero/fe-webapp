import { WorkExperienceFormPage } from "@/modules/crm/personal-data/work-experience/presentation/pages/WorkExperienceFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <WorkExperienceFormPage />
    </Suspense>
  );
}
