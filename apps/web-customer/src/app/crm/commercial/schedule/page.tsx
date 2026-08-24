"use client";

import ScheduleAgendaPage from "@/modules/crm/commercial/schedule/presentation/pages/ScheduleAgendaPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <ScheduleAgendaPage />
    </Suspense>
  );
}
