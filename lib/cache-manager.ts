/**
 * Simple in-memory cache manager untuk API requests
 * Mengurangi jumlah HTTP calls dan mempercepat loading
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set data ke cache
   * @param key Cache key
   * @param data Data yang akan di-cache
   * @param ttlSeconds Time to live in seconds (default: 5 menit)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  /**
   * Get data dari cache
   * @param key Cache key
   * @returns Cached data atau null jika expired/tidak ada
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists dan valid
   */
  has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    const entry = this.cache.get(key)!;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear specific cache key
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (untuk debugging)
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Hook untuk cache dengan deduplication
 * Mencegah multiple requests untuk data yang sama
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Execute request dengan deduplication
   * Jika request untuk key yang sama sedang berjalan,
   * return same promise (tidak ada request baru)
   */
  async execute<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Jika sudah ada pending request dengan key yang sama, return promise yang sama
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Execute request dan simpan promise
    const promise = requestFn()
      .then(result => {
        // Cleanup pending request setelah selesai
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        // Cleanup pending request jika error
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();
