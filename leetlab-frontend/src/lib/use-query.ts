import { useState, useEffect, useCallback, useRef } from "react";
import { cacheService } from "./cache";

interface UseQueryOptions<T> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  ttl?: number; // Optional TTL in milliseconds
}

export function useQuery<T>({ queryKey, queryFn, enabled = true, ttl }: UseQueryOptions<T>) {
  const [data, setData] = useState<T | undefined>(() => {
    // Try to initialize from cache if key is stable
    const key = JSON.stringify(queryKey);
    return cacheService.get<T>(key) || undefined;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const queryKeyString = JSON.stringify(queryKey);
  const isMounted = useRef(true);

  const queryFnRef = useRef(queryFn);
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const fetchFn = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    
    if (!forceRefresh && ttl) {
      const cached = cacheService.get<T>(queryKeyString);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const result = await queryFnRef.current();
      if (isMounted.current) {
        setData(result);
        if (ttl) {
          cacheService.set(queryKeyString, result, ttl);
        }
      }
    } catch (err: any) {
      if (isMounted.current) {
        setIsError(true);
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [queryKeyString, enabled, ttl]);

  useEffect(() => {
    isMounted.current = true;
    fetchFn();
    return () => {
      isMounted.current = false;
    };
  }, [fetchFn]);

  return { data, isLoading, isError, error, refetch: (force = true) => fetchFn(force) };
}
