import React from 'react';
import { getStaffAccessData } from './actions';
import { StaffAccessView } from './StaffAccessView';

export default async function UsersManagementPage() {
  const data = await getStaffAccessData();

  return <StaffAccessView initialData={data} />;
}
