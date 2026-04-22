import { PersonSkillFormPage } from "@/modules/crm/personal-data/person-skill/presentation/pages/PersonSkillFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PersonSkillFormPage params={params} />
    </Suspense>
  );
}
