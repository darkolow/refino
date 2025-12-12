import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchPrices, 
  type ResourceId, 
  type TierId, 
  type ServerId, 
  type CityId,
  type ResourcePrice,
  cities
} from '@/data/albionData';

interface UsePricesResult {
  prices: Record<CityId, ResourcePrice> | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const usePrices = (
  resourceId: ResourceId,
  tierId: TierId,
  serverId: ServerId = 'west'
): UsePricesResult => {
  const [prices, setPrices] = useState<Record<CityId, ResourcePrice> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchPrices(resourceId, tierId, serverId);
      setPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar preços';
      setError(message);
      
      // Set fallback empty prices
      const emptyPrices = {} as Record<CityId, ResourcePrice>;
      cities.forEach(city => {
        emptyPrices[city.id] = { raw: 0, rawBuy: 0, refined: 0, refinedBuy: 0 };
      });
      setPrices(emptyPrices);
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, tierId, serverId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
};
