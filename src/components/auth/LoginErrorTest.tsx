"use client";

import { Button } from "antd";
import Toast from "@/components/common/Toast";

export default function LoginErrorTest() {
  // Test different error formats
  const testSimpleError = () => {
    Toast.error("Simple error message");
  };

  const testDetailedError = () => {
    Toast.error("Authentication failed\nEmail: Invalid email format\nPassword: Password must be at least 8 characters");
  };

  const testApiErrorFormat = () => {
    const mockApiError = {
      response: {
        status: 401,
        data: {
          success: false,
          message: "Invalid email or password",
          errors: {
            email: ["Email not found"],
            password: ["Incorrect password"],
            general: ["Security policy violation"]
          },
          timestamp: new Date().toISOString(),
          path: "/api/auth/login",
          statusCode: 401,
        }
      }
    };
    
    // Extract error message similar to LoginForm
    let errorMessage = mockApiError.response.data.message;
    
    // Add validation errors
    if (mockApiError.response.data.errors) {
      const errors = mockApiError.response.data.errors as Record<string, string[]>;
      
      if (errors.email) {
        errorMessage += `\nEmail: ${errors.email.join(', ')}`;
      }
      if (errors.password) {
        errorMessage += `\nPassword: ${errors.password.join(', ')}`;
      }
      if (errors.general) {
        errorMessage += `\n${errors.general.join(', ')}`;
      }
    }
    
    Toast.error(errorMessage, 8);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Error Display Testing</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={testSimpleError}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Test Simple Error
        </Button>
        
        <div>
          <Button 
            onClick={testDetailedError}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Test Detailed Error
          </Button>
        </div>
        
        <div>
          <Button 
            onClick={testApiErrorFormat}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Test API Error Format
          </Button>
        </div>
      </div>
    </div>
  );
}