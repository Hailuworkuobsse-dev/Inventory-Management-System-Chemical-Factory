import { apiSlice } from './apiSlice';

/**
 * Quality endpoints — aligned with backend /api/v1/batches routes:
 * batches (quarantine/release/recall), lab tests, EUDR documents.
 */
export const qualityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query({
      query: (params) => ({ url: '/batches/batches', params }),
      providesTags: ['Quality'],
    }),

    getBatchById: builder.query({
      query: (id) => `/batches/batches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quality', id }],
    }),

    quarantineBatch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/batches/batches/${id}/quarantine`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }, 'Quality'],
    }),

    releaseBatch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/batches/batches/${id}/release`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }, 'Quality'],
    }),

    recallBatch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/batches/batches/${id}/recall`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }, 'Quality'],
    }),

    createLabTest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/batches/batches/${id}/lab-tests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }],
    }),

    getEudrDocument: builder.query({
      query: (id) => `/batches/batches/${id}/eudr-document`,
      providesTags: (result, error, id) => [{ type: 'Quality', id }],
    }),

    createEudrDocument: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/batches/batches/${id}/eudr-document`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quality', id }],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useQuarantineBatchMutation,
  useReleaseBatchMutation,
  useRecallBatchMutation,
  useCreateLabTestMutation,
  useGetEudrDocumentQuery,
  useCreateEudrDocumentMutation,
} = qualityApi;

export default qualityApi;
