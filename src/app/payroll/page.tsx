import React from 'react';
import { getPayrollData } from './actions';
import { PayrollView } from './PayrollView';

export default async function PayrollPage() {
  const data = await getPayrollData();

  return <PayrollView data={data} />;
}
