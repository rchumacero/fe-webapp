import React from 'react';
import WarehouseMovementReportPage from '@/modules/warehouse/warehouse/presentation/pages/WarehouseMovementReportPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <WarehouseMovementReportPage id={id} />;
}
