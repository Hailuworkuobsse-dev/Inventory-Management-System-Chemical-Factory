import { apiSlice } from './apiSlice';

export const procurementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all purchase orders
    getPurchaseOrders: builder.query({
      query: (params) => ({
        url: '/purchases',
        params,
      }),
      providesTags: ['Purchases'],
    }),

    // Get single purchase order
    getPurchaseOrderById: builder.query({
      query: (id) => `/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchases', id }],
    }),

    // Create purchase order
    createPurchaseOrder: builder.mutation({
      query: (data) => ({
        url: '/purchases',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Purchases'],
    }),

    // Update purchase order
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/purchases/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Purchases', id }],
    }),

    // Delete purchase order
    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchases'],
    }),

    // Get all suppliers
    getSuppliers: builder.query({
      query: (params) => ({
        url: '/suppliers',
        params,
      }),
      providesTags: ['Suppliers'],
    }),

    // Get single supplier
    getSupplierById: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Suppliers', id }],
    }),

    // Create supplier
    createSupplier: builder.mutation({
      query: (data) => ({
        url: '/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    // Update supplier
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Suppliers', id }],
    }),

    // Delete supplier
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Suppliers'],
    }),

    // Get pending purchase orders
    getPendingPurchaseOrders: builder.query({
      query: () => '/purchases/pending',
      providesTags: ['Purchases'],
    }),

    // Approve purchase order
    approvePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/purchases/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Purchases', id }],
    }),

    // Receive purchase order
    receivePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/purchases/${id}/receive`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Purchases', id }, 'Inventory'],
    }),

    // Get supplier performance metrics
    getSupplierPerformance: builder.query({
      query: (supplierId) => `/suppliers/${supplierId}/performance`,
      providesTags: ['Suppliers'],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetPendingPurchaseOrdersQuery,
  useApprovePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useGetSupplierPerformanceQuery,
} = procurementApi;

export default procurementApi;
