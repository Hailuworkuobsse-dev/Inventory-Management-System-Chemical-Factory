import { apiSlice } from './apiSlice';

/**
 * Procurement endpoints — aligned with backend /api/v1/purchase-orders routes
 * (suppliers, purchase orders, forex rates).
 */
export const procurementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: (params) => ({ url: '/purchase-orders/suppliers', params }),
      providesTags: ['Suppliers'],
    }),

    createSupplier: builder.mutation({
      query: (body) => ({ url: '/purchase-orders/suppliers', method: 'POST', body }),
      invalidatesTags: ['Suppliers'],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/suppliers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    getSupplierRatings: builder.query({
      query: (id) => `/purchase-orders/suppliers/${id}/ratings`,
      providesTags: (result, error, id) => [{ type: 'Suppliers', id }],
    }),

    addSupplierRating: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/suppliers/${id}/ratings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Suppliers', id }],
    }),

    getPurchaseOrders: builder.query({
      query: (params) => ({ url: '/purchase-orders/purchase-orders', params }),
      providesTags: ['Purchases'],
    }),

    getPurchaseOrderById: builder.query({
      query: (id) => `/purchase-orders/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchases', id }],
    }),

    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: '/purchase-orders/purchase-orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Purchases'],
    }),

    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/purchase-orders/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Purchases'],
    }),

    submitPurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/purchase-orders/purchase-orders/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['Purchases'],
    }),

    allocateForex: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/purchase-orders/${id}/allocate-forex`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Purchases'],
    }),

    getPrioritizedPurchaseOrders: builder.query({
      query: () => '/purchase-orders/purchase-orders/prioritize',
      providesTags: ['Purchases'],
    }),

    getForexRates: builder.query({
      query: () => '/purchase-orders/forex-rates',
      providesTags: ['ForexRates'],
    }),

    createForexRate: builder.mutation({
      query: (body) => ({ url: '/purchase-orders/forex-rates', method: 'POST', body }),
      invalidatesTags: ['ForexRates'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useGetSupplierRatingsQuery,
  useAddSupplierRatingMutation,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useSubmitPurchaseOrderMutation,
  useAllocateForexMutation,
  useGetPrioritizedPurchaseOrdersQuery,
  useGetForexRatesQuery,
  useCreateForexRateMutation,
} = procurementApi;

export default procurementApi;
