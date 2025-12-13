import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllPrices, 
  type ResourceId, 
  type ServerId, 
  type PriceData,
} from '@/data/albionData';

interface UseAllPricesResult {
  allPrices: PriceData;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useAllPrices = (
  resourceId: ResourceId,
  serverId: ServerId = 'west'
): UseAllPricesResult => {
  const [allPrices, setAllPrices] = useState<PriceData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllPrices(resourceId, serverId);
      setAllPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar preços';
      setError(message);
      setAllPrices({});
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, serverId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    allPrices,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
};
