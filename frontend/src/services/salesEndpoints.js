import { apiSlice } from './apiSlice';

/**
 * Sales endpoints — aligned with backend /api/v1/sales-orders routes.
 */
export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesOrders: builder.query({
      query: (params) => ({ url: '/sales-orders/sales-orders', params }),
      providesTags: ['Sales'],
    }),

    getSalesOrderById: builder.query({
      query: (id) => `/sales-orders/sales-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sales', id }],
    }),

    createSalesOrder: builder.mutation({
      query: (body) => ({ url: '/sales-orders/sales-orders', method: 'POST', body }),
      invalidatesTags: ['Sales'],
    }),

    updateSalesOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sales-orders/sales-orders/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sales', id }, 'Sales'],
    }),

    createReturn: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sales-orders/sales-orders/${id}/returns`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sales'],
    }),

    getReturnById: builder.query({
      query: (id) => `/sales-orders/returns/${id}`,
      providesTags: ['Returns'],
    }),

    setReturnDisposition: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sales-orders/returns/${id}/disposition`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Returns', 'Sales'],
    }),

    getCustomerPortalStock: builder.query({
      query: (params) => ({ url: '/sales-orders/customer-portal/stock', params }),
      providesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetSalesOrdersQuery,
  useGetSalesOrderByIdQuery,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderStatusMutation,
  useCreateReturnMutation,
  useGetReturnByIdQuery,
  useSetReturnDispositionMutation,
  useGetCustomerPortalStockQuery,
} = salesApi;

export default salesApi;
