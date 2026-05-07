import { apiSlice } from './apiSlice';

export const qualityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all quality control records
    getQualityRecords: builder.query({
      query: (params) => ({
        url: '/quality',
        params,
      }),
      providesTags: ['Quality'],
    }),

    // Get single quality record
    getQualityRecordById: builder.query({
      query: (id) => `/quality/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quality', id }],
    }),

    // Create quality control record
    createQualityRecord: builder.mutation({
      query: (data) => ({
        url: '/quality',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quality'],
    }),

    // Update quality record
    updateQualityRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/quality/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }],
    }),

    // Delete quality record
    deleteQualityRecord: builder.mutation({
      query: (id) => ({
        url: `/quality/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quality'],
    }),

    // Get quality checks by product
    getQualityByProduct: builder.query({
      query: (productId) => `/quality/product/${productId}`,
      providesTags: ['Quality'],
    }),

    // Get failed quality checks
    getFailedQualityChecks: builder.query({
      query: (params) => ({
        url: '/quality/failed',
        params,
      }),
      providesTags: ['Quality'],
    }),

    // Get quality statistics
    getQualityStats: builder.query({
      query: (params) => ({
        url: '/quality/statistics',
        params,
      }),
      providesTags: ['Quality'],
    }),

    // Approve quality check
    approveQualityCheck: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/quality/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }],
    }),

    // Reject quality check
    rejectQualityCheck: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/quality/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }],
    }),
  }),
});

export const {
  useGetQualityRecordsQuery,
  useGetQualityRecordByIdQuery,
  useCreateQualityRecordMutation,
  useUpdateQualityRecordMutation,
  useDeleteQualityRecordMutation,
  useGetQualityByProductQuery,
  useGetFailedQualityChecksQuery,
  useGetQualityStatsQuery,
  useApproveQualityCheckMutation,
  useRejectQualityCheckMutation,
} = qualityApi;

export default qualityApi;
