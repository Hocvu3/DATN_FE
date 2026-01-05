"use client";

import React from "react";
import { useParams } from "next/navigation";
import DocumentDetail from "@/components/admin/DocumentDetail";

export default function EmployeeDocumentDetail() {
  const params = useParams();
  const documentId = params?.id as string;

  return <DocumentDetail documentId={documentId} />;
}
