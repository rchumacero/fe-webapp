import React from "react";
import { OrganizationTreePage } from "@/modules/crm/personal-data/organization/presentation/pages/OrganizationTreePage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ personId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const personId = resolvedSearchParams.personId || '';
  
  return <OrganizationTreePage personId={personId} />;
}
