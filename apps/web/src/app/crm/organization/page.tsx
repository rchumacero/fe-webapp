import React from "react";
import { OrganizationListPage } from "@/modules/crm/personal-data/organization/presentation/pages/OrganizationListPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ personId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const personId = resolvedSearchParams.personId || '';
  
  return <OrganizationListPage personId={personId} />;
}
