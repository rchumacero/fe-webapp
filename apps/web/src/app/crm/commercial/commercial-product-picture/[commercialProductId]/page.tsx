import { Suspense } from "react";
import CommercialProductPictureListPage from "@/modules/crm/commercial/commercial-product-picture/presentation/pages/CommercialProductPictureListPage";

interface PageProps {
  params: Promise<{
    commercialProductId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { commercialProductId } = await params;
  return (
    <Suspense fallback={<div>Loading pictures...</div>}>
      <CommercialProductPictureListPage commercialProductId={commercialProductId} />
    </Suspense>
  );
}
