import AddressFormPage from '@/modules/crm/personal-data/address/presentation/pages/AddressFormPage';
import React from 'react';

export default function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  return <AddressFormPage id={resolvedParams.id} />;
}
