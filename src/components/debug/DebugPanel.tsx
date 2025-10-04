"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button, Card } from "antd";

// Dynamically import the debugger to avoid including it in production builds
const AuthDebugger = dynamic(() => import("@/components/debug/AuthDebugger"), {
  ssr: false,
});

export default function DebugPanel() {
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Only show the debug toggle in development
  const isDev = process.env.NODE_ENV === "development";
  
  if (!isDev) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <Card className="border border-orange-200">
        <div className="flex justify-between items-center">
          <div className="font-medium text-orange-500">Developer Tools</div>
          <Button 
            size="small" 
            onClick={() => setShowDebugger(!showDebugger)}
          >
            {showDebugger ? "Hide Auth Debugger" : "Show Auth Debugger"}
          </Button>
        </div>
        
        {showDebugger && <AuthDebugger />}
      </Card>
    </div>
  );
}