import { apiSlice } from './apiSlice';

/**
 * Reporting endpoints — aligned with backend /api/v1/reporting routes.
 */
export const reportingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAbcAnalysis: builder.query({
      query: (params) => ({ url: '/reporting/reports/abc-analysis', params }),
      providesTags: ['Reports'],
    }),
    getInventoryTurnover: builder.query({
      query: (params) => ({ url: '/reporting/reports/inventory-turnover', params }),
      providesTags: ['Reports'],
    }),
    getSlowMovers: builder.query({
      query: (params) => ({ url: '/reporting/reports/slow-movers', params }),
      providesTags: ['Reports'],
    }),
    getStockValuation: builder.query({
      query: (params) => ({ url: '/reporting/reports/stock-valuation', params }),
      providesTags: ['Reports'],
    }),
    getExpiryNearing: builder.query({
      query: (params) => ({ url: '/reporting/reports/expiry-nearing', params }),
      providesTags: ['Reports'],
    }),
    getStockOutRisk: builder.query({
      query: (params) => ({ url: '/reporting/reports/stock-out-risk', params }),
      providesTags: ['Reports'],
    }),
    getShrinkage: builder.query({
      query: (params) => ({ url: '/reporting/reports/shrinkage', params }),
      providesTags: ['Reports'],
    }),
    getDemandForecast: builder.query({
      query: (params) => ({ url: '/reporting/reports/demand-forecast', params }),
      providesTags: ['Reports'],
    }),
    getExecutiveDashboard: builder.query({
      query: () => '/reporting/dashboards/executive',
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetAbcAnalysisQuery,
  useGetInventoryTurnoverQuery,
  useGetSlowMoversQuery,
  useGetStockValuationQuery,
  useGetExpiryNearingQuery,
  useGetStockOutRiskQuery,
  useGetShrinkageQuery,
  useGetDemandForecastQuery,
  useGetExecutiveDashboardQuery,
} = reportingApi;

export default reportingApi;
