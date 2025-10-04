// Explicitly re-export to avoid ambiguity
export type { User } from './auth';
export {
    saveUserData,
    getUserData,
    isAuthenticated,
    hasRole,
    clearAuth,
    logout
} from './auth';

// Export provider components from authProvider
export {
    useAuth,
    AuthProvider,
    getCurrentUser
} from './authProvider';