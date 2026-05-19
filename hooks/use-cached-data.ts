import { useEffect, useState, useRef } from 'react';
import { cacheManager, requestDeduplicator } from '@/lib/cache-manager';

interface UseCachedDataOptions {
  cacheKey: string;
  cacheTTL?: number; // dalam seconds
  deduplicate?: boolean;
}

/**
 * Hook untuk fetch data dengan automatic caching & deduplication
 * Mengurangi API calls dan mempercepat loading
 */
export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  options: UseCachedDataOptions
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { cacheKey, cacheTTL = 300, deduplicate = true } = options;

        // Check cache first
        const cached = cacheManager.get<T>(cacheKey);
        if (cached) {
          if (mountedRef.current) {
            setData(cached);
            setLoading(false);
          }
          return;
        }

        // Execute request dengan deduplication
        let result: T;
        if (deduplicate) {
          result = await requestDeduplicator.execute(cacheKey, fetchFn);
        } else {
          result = await fetchFn();
        }

        // Cache the result
        cacheManager.set(cacheKey, result, cacheTTL);

        if (mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [options.cacheKey]); // Re-fetch jika cache key berubah

  return { data, loading, error };
}

/**
 * Hook untuk fetch list data dengan pagination
 * Otomatis cache per halaman
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, perPage: number) => Promise<T[]>,
  perPage: number = 10,
  cacheKeyPrefix: string = 'paginated'
): {
  data: T[];
  page: number;
  setPage: (page: number) => void;
  loading: boolean;
  error: Error | null;
} {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const cacheKey = `${cacheKeyPrefix}-page-${page}-perpage-${perPage}`;
    const cached = cacheManager.get<T[]>(cacheKey);

    if (cached) {
      if (mountedRef.current) {
        setData(cached);
        setLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await requestDeduplicator.execute(cacheKey, () =>
          fetchFn(page, perPage)
        );

        cacheManager.set(cacheKey, result, 300); // 5 menit cache

        if (mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [page, perPage, cacheKeyPrefix]);

  return { data, page, setPage, loading, error };
}
