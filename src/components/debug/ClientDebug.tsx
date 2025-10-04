"use client";

import { useEffect, useState } from "react";
import DebugLogin from "@/components/debug/DebugLogin";

export default function ClientDebug() {
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    // Check if debug param is in URL
    const url = new URL(window.location.href);
    if (url.searchParams.has('debug') || url.searchParams.has('bypass_auth')) {
      setShowDebug(true);
    }
  }, []);
  
  if (!showDebug) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <DebugLogin />
    </div>
  );
}