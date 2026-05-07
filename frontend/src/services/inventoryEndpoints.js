import { apiSlice } from './apiSlice';

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all inventory items
    getInventory: builder.query({
      query: (params) => ({
        url: '/inventory',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get single inventory item
    getInventoryById: builder.query({
      query: (id) => `/inventory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    // Update inventory quantity
    updateInventory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),

    // Batch update inventory
    batchUpdateInventory: builder.mutation({
      query: (items) => ({
        url: '/inventory/batch-update',
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Get low stock items
    getLowStock: builder.query({
      query: () => '/inventory/low-stock',
      providesTags: ['Inventory'],
    }),

    // Get out of stock items
    getOutOfStock: builder.query({
      query: () => '/inventory/out-of-stock',
      providesTags: ['Inventory'],
    }),

    // Adjust inventory (manual adjustment)
    adjustInventory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/${id}/adjust`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),

    // Get inventory history
    getInventoryHistory: builder.query({
      query: ({ id, params }) => `/inventory/${id}/history`,
      providesTags: ['Inventory'],
    }),

    // Get stock valuation
    getStockValuation: builder.query({
      query: (params) => ({
        url: '/inventory/valuation',
        params,
      }),
      providesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useUpdateInventoryMutation,
  useBatchUpdateInventoryMutation,
  useGetLowStockQuery,
  useGetOutOfStockQuery,
  useAdjustInventoryMutation,
  useGetInventoryHistoryQuery,
  useGetStockValuationQuery,
} = inventoryApi;

export default inventoryApi;
