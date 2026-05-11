import React from 'react';
import { getStaffAccessData, getCurrentUserProfile } from './actions';
import { StaffAccessView } from './StaffAccessView';
import { redirect } from 'next/navigation';

export default async function UsersManagementPage() {
  const user = await getCurrentUserProfile();
  
  if (!user) {
    redirect('/login');
  }

  const data = await getStaffAccessData();

  return <StaffAccessView initialData={data} />;
}
