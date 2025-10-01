import React from "react";
import { Modal, Button, Typography } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export type NotificationModalType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

interface NotificationModalProps {
  visible: boolean;
  title: string;
  message: React.ReactNode;
  type: NotificationModalType;
  onClose: () => void;
  buttonText?: string;
}

/**
 * A styled modal notification component for important messages
 * Use this for critical operations where a popup notification is more appropriate
 * than a toast message
 */
export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  buttonText = "Đóng",
}) => {
  // Define icon and colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: (
            <CheckCircleFilled style={{ fontSize: 48, color: "#52c41a" }} />
          ),
          color: "#52c41a",
          buttonType: "primary" as const,
        };
      case "error":
        return {
          icon: (
            <CloseCircleFilled style={{ fontSize: 48, color: "#ff4d4f" }} />
          ),
          color: "#ff4d4f",
          buttonType: "danger" as const,
        };
      case "warning":
        return {
          icon: (
            <ExclamationCircleFilled
              style={{ fontSize: 48, color: "#faad14" }}
            />
          ),
          color: "#faad14",
          buttonType: "default" as const,
        };
      case "info":
        return {
          icon: <InfoCircleFilled style={{ fontSize: 48, color: "#1890ff" }} />,
          color: "#1890ff",
          buttonType: "default" as const,
        };
      case "loading":
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
          color: "#1890ff",
          buttonType: "default" as const,
        };
      default:
        return {
          icon: <InfoCircleFilled style={{ fontSize: 48, color: "#1890ff" }} />,
          color: "#1890ff",
          buttonType: "default" as const,
        };
    }
  };

  const { icon, color, buttonType } = getTypeStyles();

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={400}
      bodyStyle={{ padding: "32px 24px" }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <Title level={4} style={{ color, marginBottom: "8px" }}>
          {title}
        </Title>
        <Text className="text-gray-600 mb-6">{message}</Text>
        <Button
          type={buttonType === "danger" ? "primary" : buttonType}
          danger={buttonType === "danger"}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

// Hook to use the notification modal
export const useNotificationModal = () => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message: React.ReactNode;
    type: NotificationModalType;
    buttonText?: string;
  }>({
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (
    title: string,
    message: React.ReactNode,
    type: NotificationModalType = "info",
    buttonText?: string
  ) => {
    setConfig({ title, message, type, buttonText });
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
  };

  const notificationModal = (
    <NotificationModal
      visible={visible}
      title={config.title}
      message={config.message}
      type={config.type}
      onClose={hideModal}
      buttonText={config.buttonText}
    />
  );

  return {
    showModal,
    hideModal,
    notificationModal,
  };
};
