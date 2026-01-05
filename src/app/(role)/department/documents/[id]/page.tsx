'use client';

import DocumentDetail from '@/components/admin/DocumentDetail';
import { useParams } from 'next/navigation';

export default function DepartmentDocumentDetail() {
  const params = useParams();
  const documentId = params.id as string;
  
  return <DocumentDetail documentId={documentId} />;
}
