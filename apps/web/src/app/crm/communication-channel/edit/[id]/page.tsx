export const runtime = 'edge';
import { CommunicationChannelFormPage } from "@/modules/crm/personal-data/communication-channel/presentation/pages/CommunicationChannelFormPage";
import { Suspense } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <CommunicationChannelFormPage params={params} />
    </Suspense>
  );
}
