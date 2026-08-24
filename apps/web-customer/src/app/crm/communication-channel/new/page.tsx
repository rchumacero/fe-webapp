import { CommunicationChannelFormPage } from "@/modules/crm/personal-data/communication-channel/presentation/pages/CommunicationChannelFormPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <CommunicationChannelFormPage />
    </Suspense>
  );
}
