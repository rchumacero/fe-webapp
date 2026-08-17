import React from 'react';
import ParameterCustomPage from '@/modules/parameter/presentation/pages/ParameterCustomPage';

interface PageProps {
  params: Promise<{ moduleCode: string }>;
}

export default async function Page({ params }: PageProps) {
  const { moduleCode } = await params;
  return <ParameterCustomPage moduleCode={moduleCode} />;
}
