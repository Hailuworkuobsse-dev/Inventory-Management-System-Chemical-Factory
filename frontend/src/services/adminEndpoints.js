import { apiSlice } from './apiSlice';

/**
 * Admin endpoints — aligned with backend /api/v1/users routes
 * (users, roles, permissions, audit log, warehouse scope).
 */
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({ url: '/users/users', params }),
      providesTags: ['Users'],
    }),

    createUser: builder.mutation({
      query: (body) => ({ url: '/users/users', method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }, 'Users'],
    }),

    getUserAuditLog: builder.query({
      query: (id) => `/users/users/${id}/audit-log`,
    }),

    setUserWarehouseScope: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/users/${id}/warehouse-scope`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }],
    }),

    getRoles: builder.query({
      query: () => '/users/roles',
      providesTags: ['Roles'],
    }),

    createRole: builder.mutation({
      query: (body) => ({ url: '/users/roles', method: 'POST', body }),
      invalidatesTags: ['Roles'],
    }),

    getPermissions: builder.query({
      query: () => '/users/permissions',
      providesTags: ['Permissions'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetUserAuditLogQuery,
  useSetUserWarehouseScopeMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useGetPermissionsQuery,
} = adminApi;

export default adminApi;
