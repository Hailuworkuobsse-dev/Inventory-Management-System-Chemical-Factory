import { apiSlice } from './apiSlice';

/**
 * Production endpoints — aligned with backend /api/v1/production routes (BOMs, work orders).
 */
export const productionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBoms: builder.query({
      query: (params) => ({ url: '/production/boms', params }),
      providesTags: ['Boms'],
    }),

    createBom: builder.mutation({
      query: (body) => ({ url: '/production/boms', method: 'POST', body }),
      invalidatesTags: ['Boms'],
    }),

    updateBom: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/production/boms/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Boms'],
    }),

    getWorkOrders: builder.query({
      query: (params) => ({ url: '/production/work-orders', params }),
      providesTags: ['WorkOrders'],
    }),

    createWorkOrder: builder.mutation({
      query: (body) => ({ url: '/production/work-orders', method: 'POST', body }),
      invalidatesTags: ['WorkOrders'],
    }),

    allocateWorkOrderMaterials: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/production/work-orders/${id}/materials`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'WorkOrders', id }],
    }),

    completeWorkOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/production/work-orders/${id}/complete`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['WorkOrders', 'Inventory'],
    }),

    getWorkOrderYield: builder.query({
      query: (id) => `/production/work-orders/${id}/yield`,
      providesTags: (result, error, id) => [{ type: 'WorkOrders', id }],
    }),
  }),
});

export const {
  useGetBomsQuery,
  useCreateBomMutation,
  useUpdateBomMutation,
  useGetWorkOrdersQuery,
  useCreateWorkOrderMutation,
  useAllocateWorkOrderMaterialsMutation,
  useCompleteWorkOrderMutation,
  useGetWorkOrderYieldQuery,
} = productionApi;

export default productionApi;
