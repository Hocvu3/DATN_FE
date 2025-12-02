"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { message } from 'antd';

function UnauthorizedAccessContent() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get('unauthorized');
  const attempted = searchParams.get('attempted');
  
  useEffect(() => {
    if (unauthorized === 'true') {
      let errorMessage = 'You do not have permission to access this area.';
      
      if (attempted) {
        const areaNames = {
          'admin': 'Admin Panel',
          'department': 'Department Management',
          'employee': 'Employee Dashboard'
        };
        const areaName = areaNames[attempted as keyof typeof areaNames] || attempted;
        errorMessage = `You do not have permission to access the ${areaName}.`;
      }
      
      message.error(errorMessage, 8);
    }
  }, [unauthorized, attempted]);
  
  // Don't render anything visible - this is just for showing the error message
  return null;
}

export default function UnauthorizedAccess() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedAccessContent />
    </Suspense>
  );
}