import { Suspense } from "react";
import MarketPlacePage from "@/modules/crm/market-place/presentation/pages/MarketPlacePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFDFD]" />}>
      <MarketPlacePage />
    </Suspense>
  );
}
