// Re-export all notification-related components and utilities
import Toast from '@/components/common/Toast';
import { NotificationModal, useNotificationModal } from '@/components/common/NotificationModal';
import { handleApiResponse, handleApiError } from '@/utils/notification';

/**
 * This module provides a unified interface for all notification-related components and utilities
 */
export {
    // Toast notifications
    Toast,

    // Modal notifications
    NotificationModal,
    useNotificationModal,

    // API response handlers
    handleApiResponse,
    handleApiError,
};

/**
 * Initialize all notification systems
 */
export const initializeNotifications = () => {
    // Configure toast messages
    Toast.config();
};

const notifications = {
    Toast,
    NotificationModal,
    useNotificationModal,
    handleApiResponse,
    handleApiError,
    initializeNotifications,
};

export default notifications;