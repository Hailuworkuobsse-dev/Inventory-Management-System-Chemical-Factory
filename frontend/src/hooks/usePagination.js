import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for pagination logic
 * @param {Array} data - The data array to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} - Pagination state and handlers
 */
export const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const paginationInfo = useMemo(
    () => ({
      currentPage,
      totalPages,
      totalItems: data.length,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
      startIndex: (currentPage - 1) * itemsPerPage + 1,
      endIndex: Math.min(currentPage * itemsPerPage, data.length),
    }),
    [currentPage, totalPages, data.length, itemsPerPage]
  );

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    ...paginationInfo,
  };
};

/**
 * Hook for server-side pagination
 */
export const useServerPagination = (fetchData, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    async (page = currentPage, size = pageSize) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchData({ page, limit: size });
        setData(result.data || []);
        setTotalItems(result.total || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, fetchData]
  );

  const totalPages = Math.ceil(totalItems / pageSize);

  const goToPage = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      fetchPage(page);
    },
    [totalPages, fetchPage]
  );

  const changePageSize = useCallback(
    (newSize) => {
      fetchPage(1, newSize);
    },
    [fetchPage]
  );

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    data,
    isLoading,
    error,
    goToPage,
    changePageSize,
    refresh: () => fetchPage(currentPage, pageSize),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

export default usePagination;
