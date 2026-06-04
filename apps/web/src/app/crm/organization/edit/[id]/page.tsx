import React from "react";
import { OrganizationFormPage } from "@/modules/crm/personal-data/organization/presentation/pages/OrganizationFormPage";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  return <OrganizationFormPage id={resolvedParams.id} />;
}
