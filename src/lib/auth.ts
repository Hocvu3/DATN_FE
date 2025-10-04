const ACCESS_TOKEN_KEY = "docuflow_access_token";
const REFRESH_TOKEN_KEY = "docuflow_refresh_token";
const USER_DATA_KEY = "docuflow_user";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  departmentId?: string;
  avatar?: string;
}

/**
 * Save authentication tokens to localStorage
 */
export function saveAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Save user data to localStorage
 */
export function saveUserData(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Get the current auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get the current user data
 */
export function getUserData(): User | null {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Check if the user has a specific role
 */
export function hasRole(role: string | string[]): boolean {
  const user = getUserData();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Log out the current user
 */
export function logout() {
  clearAuth();
}


