import { apiSlice } from './apiSlice';

/**
 * Inventory endpoints — aligned with backend /api/v1/inventory routes:
 * GET  /stock, GET /stock/:stockId, POST /receipts, GET /receipts/:id,
 * PUT  /receipts/:id/accept, POST /stock/transfer|adjustment|dispose,
 * POST /picking/reserve|confirm|pick-and-ship
 */
export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStock: builder.query({
      query: (params) => ({ url: '/inventory/stock', params }),
      providesTags: ['Inventory'],
    }),

    getStockById: builder.query({
      query: (id) => `/inventory/stock/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    getReceipts: builder.query({
      query: (params) => ({ url: '/inventory/receipts', params }),
      providesTags: ['Receipts'],
    }),

    getReceiptById: builder.query({
      query: (id) => `/inventory/receipts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Receipts', id }],
    }),

    // Offline-aware: replayed verbatim by the sync worker when connectivity returns.
    createReceipt: builder.mutation({
      query: (body) => ({ url: '/inventory/receipts', method: 'POST', body }),
      invalidatesTags: ['Receipts', 'Inventory'],
    }),

    acceptReceipt: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/receipts/${id}/accept`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Inventory', { type: 'Receipts', id }],
    }),

    transferStock: builder.mutation({
      query: (body) => ({ url: '/inventory/stock/transfer', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),

    adjustStock: builder.mutation({
      query: (body) => ({ url: '/inventory/stock/adjustment', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),

    disposeStock: builder.mutation({
      query: (body) => ({ url: '/inventory/stock/dispose', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),

    reserveForPicking: builder.mutation({
      query: (body) => ({ url: '/inventory/picking/reserve', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),

    confirmPicking: builder.mutation({
      query: (body) => ({ url: '/inventory/picking/confirm', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),

    pickAndShip: builder.mutation({
      query: (body) => ({ url: '/inventory/picking/pick-and-ship', method: 'POST', body }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetStockQuery,
  useGetStockByIdQuery,
  useGetReceiptsQuery,
  useGetReceiptByIdQuery,
  useCreateReceiptMutation,
  useAcceptReceiptMutation,
  useTransferStockMutation,
  useAdjustStockMutation,
  useDisposeStockMutation,
  useReserveForPickingMutation,
  useConfirmPickingMutation,
  usePickAndShipMutation,
} = inventoryApi;

export default inventoryApi;
