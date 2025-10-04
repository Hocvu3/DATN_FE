import { useState } from 'react';
import ApiService from '@/utils/api';
import Toast from '@/components/common/Toast';

/**
 * Hook to handle API requests with loading states and notifications
 * This hook provides a simple interface for making API calls with automatic
 * loading states and error handling with notifications
 */
export const useApi = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Make a GET request with loading state
     */
    const get = async <T = any>(
        url: string,
        options?: {
            showSuccessMessage?: boolean;
            successMessage?: string;
            showErrorMessage?: boolean;
            errorMessage?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.get<T>(url, options);
            return response;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Make a POST request with loading state
     */
    const post = async <T = any>(
        url: string,
        data?: any,
        options?: {
            showSuccessMessage?: boolean;
            successMessage?: string;
            showErrorMessage?: boolean;
            errorMessage?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.post<T>(url, data, options);
            return response;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Make a PUT request with loading state
     */
    const put = async <T = any>(
        url: string,
        data?: any,
        options?: {
            showSuccessMessage?: boolean;
            successMessage?: string;
            showErrorMessage?: boolean;
            errorMessage?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.put<T>(url, data, options);
            return response;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Make a DELETE request with loading state
     */
    const remove = async <T = any>(
        url: string,
        options?: {
            showSuccessMessage?: boolean;
            successMessage?: string;
            showErrorMessage?: boolean;
            errorMessage?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.delete<T>(url, options);
            return response;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Execute any async function with loading state and automatic error handling
     */
    const execute = async <T = any>(
        asyncFn: () => Promise<T>,
        options?: {
            loadingMessage?: string;
            successMessage?: string;
            errorMessage?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        let loadingToast;

        if (options?.loadingMessage) {
            loadingToast = Toast.loading(options.loadingMessage);
        }

        try {
            const result = await asyncFn();

            if (loadingToast) {
                loadingToast();
            }

            if (options?.successMessage) {
                Toast.success(options.successMessage);
            }

            return result;
        } catch (err) {
            setError(err as Error);

            if (loadingToast) {
                loadingToast();
            }

            const errorMessage = options?.errorMessage ||
                (err instanceof Error ? err.message : 'An error occurred');
            Toast.error(errorMessage);

            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        get,
        post,
        put,
        delete: remove,
        execute,
    };
};