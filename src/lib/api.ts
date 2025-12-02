import { getAuthToken, getRefreshToken, saveAuthTokens } from './authProvider';

export type ApiResult<T> = { data: T; status: number };

const DEFAULT_TIMEOUT_MS = 20000;

// Track if a token refresh is in progress to avoid multiple simultaneous refresh attempts
let isRefreshingToken = false;
// Queue of requests to retry after token refresh
let refreshQueue: Array<() => void> = [];

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  return `${base}/api`;
}

export interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
  params?: Record<string, string | number | undefined>;
}

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshingToken) {
    // If a refresh is already in progress, return a promise that resolves when it's done
    return new Promise<boolean>((resolve) => {
      refreshQueue.push(() => resolve(true));
    });
  }

  isRefreshingToken = true;

  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }


    // Make direct fetch request to refresh endpoint
    const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (!data.accessToken) {
      return false;
    }

    // Update tokens in storage
    saveAuthTokens(data.accessToken, data.refreshToken || refreshToken);

    // Process the queue of waiting requests
    refreshQueue.forEach(callback => callback());
    refreshQueue = [];

    return true;
  } catch (error) {
    return false;
  } finally {
    isRefreshingToken = false;
  }
}

/**
 * Common API request handler with authentication support
 */
async function apiRequest<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options?: ApiOptions,
): Promise<ApiResult<TResponse>> {
  const controller = new AbortController();
  const timeoutMs = options?.timeout || DEFAULT_TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Create headers object with string values
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Add any custom headers from options
  if (options?.headers) {
    const headerEntries = Object.entries(options.headers);
    for (const [key, value] of headerEntries) {
      if (value !== undefined) {
        headers[key] = String(value);
      }
    }
  }

  // Add auth token if required
  if (options?.requiresAuth !== false) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
      ...options,
    });

    clearTimeout(id);

    // Handle 401 Unauthorized with token refresh
    if (res.status === 401 && options?.requiresAuth !== false && path !== '/auth/refresh') {

      // Try to refresh the token
      const refreshSuccessful = await refreshAccessToken();

      if (refreshSuccessful) {
        // Retry the original request with new token
        return apiRequest<TResponse>(method, path, body, options);
      } else {
        // Force redirect to login page
        if (typeof window !== 'undefined') {
          // Clear auth state before redirecting
          document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = '/login?unauthorized=true';
        }

        // Still throw the error for proper handling
        throw new Error('Authentication failed');
      }
    }

    if (!res.ok) {
      try {
        // Clone the response before using it
        const responseClone = res.clone();
        let responseData = {};

        try {
          responseData = await responseClone.json();
        } catch {
          // JSON parsing failed, continue with empty data
        }

        const message = (responseData as any).message || res.statusText || "Request failed";

        // Create error with full details
        const error = new Error(message);
        (error as any).response = {
          status: res.status,
          data: responseData
        };
        throw error;
      } catch (error) {
        // Re-throw the error if it's our constructed error, otherwise create a simple one
        if ((error as any).response) {
          throw error;
        }

        const simpleError = new Error(res.statusText || "Request failed");
        (simpleError as any).response = {
          status: res.status,
          data: {}
        };
        throw simpleError;
      }
    }

    // Check if the response has any content
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return {
        data: (await res.json()) as TResponse,
        status: res.status
      };
    } else {
      // Handle empty responses or non-JSON responses
      return {
        data: {} as TResponse,
        status: res.status
      };
    }
  } catch (error) {
    clearTimeout(id);

    // Check if this is an abort error from our timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }

    // Re-throw other errors
    throw error;
  }
}

// Convenience methods for different HTTP verbs
export function apiGet<TResponse>(path: string, options?: ApiOptions): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>('GET', path, undefined, options);
}

export function apiPost<TResponse>(path: string, body?: unknown, options?: ApiOptions): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>('POST', path, body, options);
}

export function apiPut<TResponse>(path: string, body?: unknown, options?: ApiOptions): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>('PUT', path, body, options);
}

export function apiPatch<TResponse>(path: string, body?: unknown, options?: ApiOptions): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>('PATCH', path, body, options);
}

export function apiDelete<TResponse>(path: string, options?: ApiOptions): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>('DELETE', path, undefined, options);
}

// API client namespaces
export const AuthApi = {
  async login(payload: { email: string; password: string }) {
    // Mock mode: bypass backend for quick testing
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true" ||
      (payload.email === "admin@docuflow.com" && payload.password === "password")) {

      await new Promise((r) => setTimeout(r, 600));

      // Create a realistic looking JWT token
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AZG9jdWZsb3cuY29tIiwicm9sZSI6ImFkbWluIn0.8tat9ExjJgNu8KB-MBCwgDkOi0iQpcjKbdHsB9Z7mQ8";

      // Detect which role to mock based on email
      let role = "admin";
      if (payload.email.includes('employee')) {
        role = "employee";
      } else if (payload.email.includes('department')) {
        role = "department";
      }


      return {
        data: {
          accessToken: mockToken,
          refreshToken: "mock-refresh-token-" + Math.random(),
          user: {
            id: "1",
            email: payload.email,
            name: payload.email.split('@')[0].replace(/[.]/g, ' '),
            role: role
          },
        },
        status: 200,
      } as const;
    }

    // Real API call for login
    const loginResponse = await apiPost<{
      success?: boolean;
      message?: string;
      data?: {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; name: string; role: string };
      };
    }>("/auth/login", payload, { requiresAuth: false });

    // Handle the nested response structure from the backend
    // Backend returns: { success: true, data: { accessToken, user, ... } }
    // apiPost wraps this in: { data: backendResponse, status: 200 }
    const backendResponse = loginResponse.data as any;

    // If it's already in the expected format (mock or direct), return as is
    if (backendResponse.accessToken && backendResponse.user) {
      return loginResponse;
    }

    // If it's the nested format, extract the inner data
    if (backendResponse.success && backendResponse.data) {
      return {
        data: backendResponse.data,
        status: loginResponse.status
      };
    }

    // If the structure is unexpected, log and return the original response
    return loginResponse;
  },

  async refresh(refreshToken: string) {
    return apiPost<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", { refreshToken }, { requiresAuth: false });
  },

  async logout() {
    // Attempt to call logout endpoint if user is authenticated
    try {
      return await apiPost("/auth/logout", {});
    } catch (error) {
      // Return a fake successful response even if the API call fails
      return { data: { success: true }, status: 200 };
    }
  },

  googleUrl() {
    return `${getBaseUrl()}/auth/google`;
  },

  async inviteUser(payload: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roleId?: string;
    departmentId?: string;
    message?: string;
  }) {
    return apiPost<{
      message: string;
      email: string;
      invitationToken: string;
    }>("/auth/invite", payload);
  },
};

export const DocumentsApi = {
  getAll(params?: { status?: string; departmentId?: string; search?: string }) {
    return apiGet('/documents', { params });
  },

  getById(id: string) {
    return apiGet(`/documents/${id}`);
  },

  create(document: { title: string; content?: string; departmentId: string; tags?: string[] }) {
    return apiPost('/documents', document);
  },

  update(id: string, document: { title?: string; content?: string; departmentId?: string; tags?: string[] }) {
    return apiPut(`/documents/${id}`, document);
  },

  delete(id: string) {
    return apiDelete(`/documents/${id}`);
  },
};

export const UsersApi = {
  getMe() {
    return apiGet<{
      id: string;
      email: string;
      name: string;
      role: string;
      department?: { id: string; name: string };
    }>('/users/me');
  },

  updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
    return apiPut<{
      id: string;
      email: string;
      name: string;
    }>('/users/profile', data);
  },

  updateAvatar(formData: FormData) {
    return apiPost<{
      avatarUrl: string;
    }>('/users/avatar', formData, {
      headers: {
        // Don't set Content-Type, let the browser set it with the boundary
        'Content-Type': undefined as any
      }
    });
  },

  getAll() {
    return apiGet('/admin/users');
  },

  create(user: { email: string; password: string; name: string; roleId: string; departmentId: string }) {
    return apiPost('/admin/users', user);
  },

  update(id: string, data: { name?: string; email?: string; roleId?: string; departmentId?: string; active?: boolean }) {
    return apiPut(`/admin/users/${id}`, data);
  },

  delete(id: string) {
    return apiDelete(`/admin/users/${id}`);
  },
};

// Helper function for downloading blob data
export async function apiDownloadBlob(
  path: string,
  options: ApiOptions = {}
): Promise<Blob> {
  const controller = new AbortController();
  const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Build headers
  const headers: Record<string, string> = {};

  // Add auth token if required (default to false for public downloads)
  if (options?.requiresAuth === true) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      signal: controller.signal,
      ...options,
    });

    clearTimeout(id);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.blob();
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Helper functions may be added here if needed in the future


