import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import UserProfileListPage from "@/modules/access/user-profile/presentation/pages/UserProfileListPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UserProfileListPage />
    </Suspense>
  );
}
