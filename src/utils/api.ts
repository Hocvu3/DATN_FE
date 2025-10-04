import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError, handleApiResponse } from './notification';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types for API calls with notification options
interface ApiRequestOptions extends AxiosRequestConfig {
    showSuccessMessage?: boolean;
    showErrorMessage?: boolean;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * Enhanced API service with built-in notification handling
 */
export const ApiService = {
    /**
     * GET request with notification support
     */
    async get<T = any>(
        url: string,
        options?: ApiRequestOptions
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.get(url, options);

            if (options?.showSuccessMessage) {
                handleApiResponse(response.status, options?.successMessage);
            }

            return response.data;
        } catch (error) {
            if (options?.showErrorMessage !== false) {
                handleApiError(error, options?.errorMessage);
            }
            throw error;
        }
    },

    /**
     * POST request with notification support
     */
    async post<T = any>(
        url: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.post(url, data, options);

            if (options?.showSuccessMessage !== false) {
                handleApiResponse(response.status, options?.successMessage);
            }

            return response.data;
        } catch (error) {
            if (options?.showErrorMessage !== false) {
                handleApiError(error, options?.errorMessage);
            }
            throw error;
        }
    },

    /**
     * PUT request with notification support
     */
    async put<T = any>(
        url: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.put(url, data, options);

            if (options?.showSuccessMessage !== false) {
                handleApiResponse(response.status, options?.successMessage);
            }

            return response.data;
        } catch (error) {
            if (options?.showErrorMessage !== false) {
                handleApiError(error, options?.errorMessage);
            }
            throw error;
        }
    },

    /**
     * PATCH request with notification support
     */
    async patch<T = any>(
        url: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.patch(url, data, options);

            if (options?.showSuccessMessage !== false) {
                handleApiResponse(response.status, options?.successMessage);
            }

            return response.data;
        } catch (error) {
            if (options?.showErrorMessage !== false) {
                handleApiError(error, options?.errorMessage);
            }
            throw error;
        }
    },

    /**
     * DELETE request with notification support
     */
    async delete<T = any>(
        url: string,
        options?: ApiRequestOptions
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.delete(url, options);

            if (options?.showSuccessMessage !== false) {
                handleApiResponse(response.status, options?.successMessage);
            }

            return response.data;
        } catch (error) {
            if (options?.showErrorMessage !== false) {
                handleApiError(error, options?.errorMessage);
            }
            throw error;
        }
    },
};

// Add authorization header with JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
                        { refreshToken }
                    );

                    if (response.data.accessToken) {
                        // Save new tokens
                        localStorage.setItem('accessToken', response.data.accessToken);
                        if (response.data.refreshToken) {
                            localStorage.setItem('refreshToken', response.data.refreshToken);
                        }

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                        return axios(originalRequest);
                    }
                }
            } catch {
                // If refresh fails, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login?session=expired';
            }
        }

        return Promise.reject(error);
    }
);

export default ApiService;