"use client";

import { saveAuthTokens, saveUserData } from "./auth";

/**
 * Mock roles available in the system
 */
export enum MockRole {
    ADMIN = "ADMIN",
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
    EMPLOYEE = "EMPLOYEE"
}

/**
 * Mock user data for development purposes
 */
const mockUsers = {
    admin: {
        id: "admin-user-id",
        email: "admin@docuflow.com",
        name: "Admin User",
        role: MockRole.ADMIN,
        avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    },
    department: {
        id: "department-head-id",
        email: "department@docuflow.com",
        name: "Department Head",
        role: MockRole.DEPARTMENT_HEAD,
        departmentId: "dept-1",
        avatar: "https://ui-avatars.com/api/?name=Department+Head&background=F97316&color=fff",
    },
    employee: {
        id: "employee-user-id",
        email: "employee@docuflow.com",
        name: "Employee User",
        role: MockRole.EMPLOYEE,
        departmentId: "dept-1",
        avatar: "https://ui-avatars.com/api/?name=Employee+User&background=22C55E&color=fff",
    }
};

/**
 * Login with a mock user for development purposes
 */
export function mockLogin(userType: "admin" | "department" | "employee") {
    const mockUser = mockUsers[userType];
    const mockToken = `mock-token-${Date.now()}-${userType}`;
    const mockRefreshToken = `mock-refresh-token-${Date.now()}-${userType}`;

    saveAuthTokens(mockToken, mockRefreshToken);
    saveUserData(mockUser);

    return {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
        user: mockUser
    };
}