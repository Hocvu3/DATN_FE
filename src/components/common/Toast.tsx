import React from "react";
import { message, ConfigProvider } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from "@ant-design/icons";

// Define message theme that matches the login page theme
const messageTheme = {
  token: {
    colorSuccess: "#52c41a",
    colorError: "#ff4d4f",
    colorWarning: "#faad14",
    colorInfo: "#1890ff",
    borderRadius: 8,
    boxShadowSecondary: "0 6px 16px rgba(0, 0, 0, 0.08)",
  },
};

// Configure message globally
if (typeof window !== 'undefined') {
  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });
}

// Custom notification component for various message types
export const Toast = {
  /**
   * Configure global message settings
   */
  config() {
    message.config({
      top: 80,
      duration: 3,
      maxCount: 3,
    });
  },

  /**
   * Success toast notification
   */
  success(content: React.ReactNode, duration?: number) {
    return message.success({
      content: (
        <ConfigProvider theme={messageTheme}>
          <div className="flex items-center">
            <CheckCircleFilled className="mr-2 text-success-600" />
            <div>{content}</div>
          </div>
        </ConfigProvider>
      ),
      duration,
      className: "custom-toast success-toast",
    });
  },

  /**
   * Error toast notification
   * Supports multiline error messages with proper formatting for API responses
   */
  error(content: React.ReactNode, duration?: number) {
    // Handle multi-line error messages from API
    const formattedContent = typeof content === 'string' && content.includes('\n')
      ? (
        <div className="error-message-container">
          {content.split('\n\n').map((paragraph, i) => (
            <React.Fragment key={`p-${i}`}>
              {i > 0 && <div className="error-message-separator"></div>}
              <div className={i === 0 ? "error-message-primary" : "error-message-details"}>
                {paragraph.split('\n').map((line, j) => (
                  <div key={`l-${i}-${j}`} className="error-message-line">
                    {line}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      ) 
      : content;
    
    return message.error({
      content: (
        <ConfigProvider theme={messageTheme}>
          <div className="flex items-start">
            <CloseCircleFilled className="mr-2 text-error-600 mt-1" />
            <div>{formattedContent}</div>
          </div>
        </ConfigProvider>
      ),
      duration: duration || 6, // Longer duration for error messages with details
      className: "custom-toast error-toast",
    });
  },

  /**
   * Warning toast notification
   */
  warning(content: React.ReactNode, duration?: number) {
    return message.warning({
      content: (
        <ConfigProvider theme={messageTheme}>
          <div className="flex items-center">
            <ExclamationCircleFilled className="mr-2 text-warning-600" />
            <div>{content}</div>
          </div>
        </ConfigProvider>
      ),
      duration,
      className: "custom-toast warning-toast",
    });
  },

  /**
   * Info toast notification
   */
  info(content: React.ReactNode, duration?: number) {
    return message.info({
      content: (
        <ConfigProvider theme={messageTheme}>
          <div className="flex items-center">
            <InfoCircleFilled className="mr-2 text-info-600" />
            <div>{content}</div>
          </div>
        </ConfigProvider>
      ),
      duration,
      className: "custom-toast info-toast",
    });
  },

  /**
   * Loading toast notification
   */
  loading(content: React.ReactNode, duration?: number) {
    return message.loading({
      content: (
        <ConfigProvider theme={messageTheme}>
          <div className="flex items-center">
            <LoadingOutlined spin className="mr-2 text-info-600" />
            <div>{content}</div>
          </div>
        </ConfigProvider>
      ),
      duration,
      className: "custom-toast loading-toast",
    });
  },
};

// Add global styles for toast notifications
const addGlobalStyles = () => {
  if (typeof document !== "undefined") {
    // Check if the style element already exists to avoid duplicates
    const existingStyle = document.getElementById('toast-global-styles');
    if (existingStyle) return;
    
    const styleElement = document.createElement("style");
    styleElement.id = 'toast-global-styles';
    styleElement.innerHTML = `
    .custom-toast {
      padding: 10px 16px;
      border-radius: 8px;
      box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08);
      font-weight: 500;
    }
    
    .custom-toast.success-toast .ant-message-notice-content {
      background-color: #f6ffed;
      border-left: 4px solid #52c41a;
    }
    
    .custom-toast.error-toast .ant-message-notice-content {
      background-color: #fff2f0;
      border-left: 4px solid #ff4d4f;
    }
    
    .custom-toast.warning-toast .ant-message-notice-content {
      background-color: #fffbe6;
      border-left: 4px solid #faad14;
    }
    
    .custom-toast.info-toast .ant-message-notice-content,
    .custom-toast.loading-toast .ant-message-notice-content {
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
    }

    /* Detailed error message formatting */
    .error-message-container {
      max-width: 400px;
    }
    
    .error-message-primary {
      font-weight: 600;
    }
    
    .error-message-details {
      font-size: 0.9em;
      opacity: 0.9;
    }
    
    .error-message-separator {
      height: 1px;
      background-color: rgba(255, 77, 79, 0.2);
      margin: 8px 0;
    }
    
    .error-message-line {
      margin: 3px 0;
    }
    
    .custom-toast.error-toast .ant-message-notice-content {
      max-width: 90vw;
      width: auto;
    }
  `;

    document.head.appendChild(styleElement);
  }
}

// Add styles in client-side
if (typeof window !== 'undefined') {
  addGlobalStyles();
}

export default Toast;
