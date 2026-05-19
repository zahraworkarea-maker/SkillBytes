/**
 * Hook untuk pagination dengan data besar
 * Memisahkan data ke halaman untuk mengurangi rendering beban
 */

import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface UsePaginationResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * Hook untuk handle pagination dari list data
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 10
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);

  // Validasi current page
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  // Hitung paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return items.slice(startIndex, endIndex);
  }, [items, validPage, currentPageSize]);

  const goToPage = useCallback((page: number) => {
    const validatedPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validatedPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(validPage + 1);
  }, [validPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(validPage - 1);
  }, [validPage, goToPage]);

  const setPageSize = useCallback((size: number) => {
    setCurrentPageSize(Math.max(1, size));
    setCurrentPage(1); // Reset ke halaman pertama
  }, []);

  return {
    items: paginatedItems,
    currentPage: validPage,
    pageSize: currentPageSize,
    totalPages: totalPages || 1,
    totalItems,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}

/**
 * Utility untuk membuat array pagination links
 * Contoh: [1, 2, 3, '...', 10]
 */
export function getPaginationLinks(
  currentPage: number,
  totalPages: number,
  sideButtons: number = 2
): (number | string)[] {
  const links: (number | string)[] = [];

  // Always show first page
  links.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - sideButtons);
  const rangeEnd = Math.min(totalPages - 1, currentPage + sideButtons);

  // Add ellipsis and range
  if (rangeStart > 2) {
    links.push('...');
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    links.push(i);
  }

  // Add ellipsis and last page
  if (rangeEnd < totalPages - 1) {
    links.push('...');
  }

  if (totalPages > 1) {
    links.push(totalPages);
  }

  return links;
}
