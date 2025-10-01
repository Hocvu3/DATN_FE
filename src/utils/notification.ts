import { message as antMessage } from 'antd';
import React from 'react';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

// Custom message types for different HTTP statuses
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Styled message config
const defaultDuration = 3; // seconds
const defaultMessageConfig = {
    style: {
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '8px 12px',
    },
};

/**
 * Handle API response notifications in a consistent way across the application
 * @param type Type of notification
 * @param content Message content
 * @param duration Duration in seconds
 */
export const showNotification = (
    type: NotificationType,
    content: React.ReactNode,
    duration: number = defaultDuration
) => {
    const config = {
        content,
        duration,
        ...defaultMessageConfig
    };

    const successConfig = {
        ...config,
        icon: React.createElement(CheckCircleFilled, { style: { color: '#52c41a' } })
    };

    const errorConfig = {
        ...config,
        icon: React.createElement(CloseCircleFilled, { style: { color: '#ff4d4f' } })
    };

    switch (type) {
        case 'success':
            return antMessage.success(successConfig);
        case 'error':
            return antMessage.error(errorConfig);
        case 'warning':
            return antMessage.warning(config);
        case 'info':
            return antMessage.info(config);
        case 'loading':
            return antMessage.loading(config);
        default:
            return antMessage.info(config);
    }
};

/**
 * Handle API response status codes
 * @param statusCode HTTP status code
 * @param message Custom message (optional)
 */
export const handleApiResponse = (statusCode: number, customMessage?: string) => {
    // Map HTTP status code to appropriate message and type
    let type: NotificationType;
    let content: string;

    switch (statusCode) {
        // Success cases
        case 200:
        case 201:
        case 204:
            type = 'success';
            content = customMessage || 'Operation successful!';
            break;

        // Client errors
        case 400:
            type = 'error';
            content = customMessage || 'Invalid request. Please check your information!';
            break;
        case 401:
            type = 'error';
            content = customMessage || 'Session expired. Please login again!';
            break;
        case 403:
            type = 'error';
            content = customMessage || 'You do not have permission to perform this action!';
            break;
        case 404:
            type = 'error';
            content = customMessage || 'Requested resource not found!';
            break;
        case 409:
            type = 'error';
            content = customMessage || 'Data conflict. Please check your information!';
            break;
        case 422:
            type = 'error';
            content = customMessage || 'Invalid data. Please check your information!';
            break;

        // Server errors
        case 500:
        case 502:
        case 503:
        case 504:
            type = 'error';
            content = customMessage || 'System error. Please try again later!';
            break;

        // Other errors
        default:
            if (statusCode >= 200 && statusCode < 300) {
                type = 'success';
                content = customMessage || 'Operation successful!';
            } else {
                type = 'error';
                content = customMessage || 'An error occurred. Please try again!';
            }
    }

    return showNotification(type, content);
};

/**
 * Handle API error object
 * @param error Error object from API call
 * @param fallbackMessage Fallback message if error doesn't have response
 */
export const handleApiError = (error: any, fallbackMessage?: string) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        let message = fallbackMessage;
        let errors: Record<string, string[]> | undefined;

        // Try to get error message from DocuFlow API Response structure
        if (error.response.data) {
            if (typeof error.response.data === 'string') {
                message = error.response.data;
            } else if (error.response.data.message) {
                // Use message from our standard ApiResponse
                message = error.response.data.message;
            } else if (error.response.data.error) {
                message = error.response.data.error;
            }

            // Get validation errors if they exist
            if (error.response.data.errors) {
                errors = error.response.data.errors;
            }
        }

        // If we have validation errors, show them in a more detailed way
        if (errors && Object.keys(errors).length > 0) {
            // Format validation errors for display
            const errorDetails = Object.entries(errors)
                .map(([field, msgs]) => {
                    if (field === 'general') {
                        return msgs.join(', ');
                    }
                    return `${field}: ${msgs.join(', ')}`;
                })
                .join('\n');

            // Show the main message with validation details
            const detailedMessage = `${message}\n\n${errorDetails}`;
            return showNotification('error', detailedMessage);
        }

        return handleApiResponse(statusCode, message);
    } else if (error.request) {
        // The request was made but no response was received
        return showNotification('error', 'Unable to connect to server. Please check your network connection!');
    } else {
        // Something happened in setting up the request that triggered an Error
        return showNotification('error', fallbackMessage || 'An error occurred while processing your request!');
    }
};

/**
 * Show loading notification for async operations
 * @param message Loading message
 * @param asyncFn Async function to execute
 */
export const withLoadingNotification = async <T>(
    loadingMessage: string,
    asyncFn: () => Promise<T>
): Promise<T> => {
    const loadingNotification = showNotification('loading', loadingMessage);

    try {
        const result = await asyncFn();
        if (typeof loadingNotification === 'function') {
            loadingNotification();
        }
        return result;
    } catch (error) {
        if (typeof loadingNotification === 'function') {
            loadingNotification();
        }
        handleApiError(error);
        throw error;
    }
};