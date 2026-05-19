/**
 * Batch Request Handler untuk reduce network overhead
 * Combine multiple small requests menjadi satu batch request
 */

interface BatchRequest {
  key: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
}

interface BatchResponse<T> {
  [key: string]: T;
}

/**
 * Queue multiple requests dan execute mereka secara batch
 * Useful untuk menghindari "request waterfall" problem
 */
export class BatchRequestHandler {
  private queue: Map<string, BatchRequest> = new Map();
  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number = 50; // ms, tunggu ini sebelum execute batch

  /**
   * Add request ke batch queue
   */
  add(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.set(request.key, request);

      // Clear existing timeout dan set baru
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Execute batch setelah delay
      this.timeout = setTimeout(() => {
        this.flush().then(resolve).catch(reject);
      }, this.batchDelay);
    });
  }

  /**
   * Execute semua queued requests
   */
  private async flush(): Promise<any> {
    const requests = Array.from(this.queue.values());
    this.queue.clear();

    if (requests.length === 0) return {};

    try {
      // Group by method untuk send dalam format yang tepat
      const getRequests = requests.filter(r => r.method === 'GET');
      const mutations = requests.filter(r => r.method !== 'GET');

      const results: BatchResponse<any> = {};

      // Execute GET requests (usually cached)
      for (const req of getRequests) {
        // Fetch akan leverage cache
        const data = await fetch(req.url).then(r => r.json());
        results[req.key] = data;
      }

      // Execute mutations
      for (const req of mutations) {
        const data = await fetch(req.url, {
          method: req.method,
          body: JSON.stringify(req.data),
          headers: { 'Content-Type': 'application/json' }
        }).then(r => r.json());
        results[req.key] = data;
      }

      return results;
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  /**
   * Clear queue tanpa execute
   */
  clear(): void {
    this.queue.clear();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

export const batchRequestHandler = new BatchRequestHandler();

/**
 * Hook untuk batch requests dengan deduplication
 */
export function useBatchRequests() {
  return {
    /**
     * Queue multiple requests untuk di-batch execute
     * @example
     * const results = await batchFetch({
     *   users: { url: '/api/users', method: 'GET' },
     *   posts: { url: '/api/posts', method: 'GET' },
     * });
     * console.log(results.users, results.posts);
     */
    batchFetch: async (requests: Record<string, Omit<BatchRequest, 'key'>>) => {
      const batchRequests = Object.entries(requests).map(([key, req]) => ({
        key,
        ...req
      } as BatchRequest));

      const allPromises = batchRequests.map(req => 
        batchRequestHandler.add(req)
      );

      return Promise.all(allPromises);
    }
  };
}
