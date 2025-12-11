import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export const RolesApi = {
  /**
   * Get all roles (Admin only)
   */
  async getAll() {
    return apiGet<{ data: Role[] }>('/admin/roles');
  },

  /**
   * Get role by ID (Admin only)
   */
  async getById(id: string) {
    return apiGet<{ data: Role }>(`/admin/roles/${id}`);
  },

  /**
   * Create new role (Admin only)
   */
  async create(data: CreateRoleDto) {
    return apiPost<{ data: Role }>('/admin/roles', data);
  },

  /**
   * Update role (Admin only)
   */
  async update(id: string, data: UpdateRoleDto) {
    return apiPut<{ data: Role }>(`/admin/roles/${id}`, data);
  },

  /**
   * Delete role (Admin only)
   */
  async delete(id: string) {
    return apiDelete<{ message: string }>(`/admin/roles/${id}`);
  },

  /**
   * Assign role to user (Admin only)
   */
  async assignToUser(roleId: string, userId: string) {
    return apiPut<{ data: { userId: string; roleId: string; roleName: string } }>(
      `/admin/roles/${roleId}/users/${userId}`,
      {}
    );
  },
};
