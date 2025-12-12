import React from 'react';
import { cities, resourceTypes, type ResourceId, type CityId, type ResourcePrice } from '@/data/albionData';
import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

interface PriceTableProps {
  selectedResource: ResourceId;
  prices: Record<CityId, ResourcePrice> | null;
  isLoading: boolean;
  error: string | null;
}

export const PriceTable = ({ selectedResource, prices, isLoading, error }: PriceTableProps) => {
  const resource = resourceTypes.find(r => r.id === selectedResource)!;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Carregando preços...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <span className="text-destructive text-sm">{error}</span>
          <span className="text-muted-foreground text-xs">
            Tente novamente ou verifique sua conexão
          </span>
        </div>
      </div>
    );
  }

  if (!prices) return null;

  // Filter out cities with no data
  const citiesWithData = cities.filter(city => 
    prices[city.id]?.raw > 0 || prices[city.id]?.refined > 0 ||
    prices[city.id]?.rawBuy > 0 || prices[city.id]?.refinedBuy > 0
  );

  // Find best prices for raw
  const rawSellPrices = cities.map(c => ({ city: c.id, price: prices[c.id]?.raw || 0 })).filter(p => p.price > 0);
  const rawBuyPrices = cities.map(c => ({ city: c.id, price: prices[c.id]?.rawBuy || 0 })).filter(p => p.price > 0);
  
  // For selling: you want highest buy order (someone buying from you)
  const bestSellRaw = rawBuyPrices.length > 0 ? rawBuyPrices.reduce((a, b) => a.price > b.price ? a : b) : null;
  // For buying: you want lowest sell order (cheapest to buy)
  const bestBuyRaw = rawSellPrices.length > 0 ? rawSellPrices.reduce((a, b) => a.price < b.price ? a : b) : null;

  // Find best prices for refined
  const refinedSellPrices = cities.map(c => ({ city: c.id, price: prices[c.id]?.refined || 0 })).filter(p => p.price > 0);
  const refinedBuyPrices = cities.map(c => ({ city: c.id, price: prices[c.id]?.refinedBuy || 0 })).filter(p => p.price > 0);
  
  const bestSellRefined = refinedBuyPrices.length > 0 ? refinedBuyPrices.reduce((a, b) => a.price > b.price ? a : b) : null;
  const bestBuyRefined = refinedSellPrices.length > 0 ? refinedSellPrices.reduce((a, b) => a.price < b.price ? a : b) : null;

  const formatPrice = (price: number) => {
    if (price === 0) return '—';
    return price.toLocaleString('pt-BR');
  };

  const getCityColor = (cityId: CityId) => {
    const city = cities.find(c => c.id === cityId);
    return city?.color || 'hsl(0, 0%, 50%)';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-display text-foreground">Cidade</th>
              <th className="text-center py-2 px-1 font-display text-foreground" colSpan={2}>
                <div className="flex flex-col">
                  <span>{resource.name}</span>
                  <span className="text-muted-foreground text-xs font-normal">(Bruto)</span>
                </div>
              </th>
              <th className="text-center py-2 px-1 font-display text-foreground" colSpan={2}>
                <div className="flex flex-col">
                  <span>{resource.refined}</span>
                  <span className="text-muted-foreground text-xs font-normal">(Refinado)</span>
                </div>
              </th>
            </tr>
            <tr className="border-b border-border/50 text-xs text-muted-foreground">
              <th></th>
              <th className="py-1 px-1 font-normal">Venda</th>
              <th className="py-1 px-1 font-normal">Compra</th>
              <th className="py-1 px-1 font-normal">Venda</th>
              <th className="py-1 px-1 font-normal">Compra</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, index) => {
              const rawSell = prices[city.id]?.raw || 0;
              const rawBuy = prices[city.id]?.rawBuy || 0;
              const refinedSell = prices[city.id]?.refined || 0;
              const refinedBuy = prices[city.id]?.refinedBuy || 0;
              
              const isBestBuyRaw = bestBuyRaw?.city === city.id;
              const isBestSellRaw = bestSellRaw?.city === city.id;
              const isBestBuyRefined = bestBuyRefined?.city === city.id;
              const isBestSellRefined = bestSellRefined?.city === city.id;

              return (
                <tr
                  key={city.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCityColor(city.id) }}
                      />
                      <span className="font-medium text-xs">{city.name}</span>
                    </div>
                  </td>
                  
                  {/* Raw Sell (Sell Orders - where you BUY from) */}
                  <td className="py-2 px-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-mono text-xs ${isBestBuyRaw ? 'text-success font-bold' : rawSell === 0 ? 'text-muted-foreground' : ''}`}>
                        {formatPrice(rawSell)}
                      </span>
                      {isBestBuyRaw && rawSell > 0 && (
                        <ArrowDown className="w-3 h-3 text-success" />
                      )}
                    </div>
                  </td>
                  
                  {/* Raw Buy (Buy Orders - where you SELL to) */}
                  <td className="py-2 px-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-mono text-xs ${isBestSellRaw ? 'text-primary font-bold' : rawBuy === 0 ? 'text-muted-foreground' : ''}`}>
                        {formatPrice(rawBuy)}
                      </span>
                      {isBestSellRaw && rawBuy > 0 && (
                        <ArrowUp className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </td>
                  
                  {/* Refined Sell */}
                  <td className="py-2 px-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-mono text-xs ${isBestBuyRefined ? 'text-success font-bold' : refinedSell === 0 ? 'text-muted-foreground' : ''}`}>
                        {formatPrice(refinedSell)}
                      </span>
                      {isBestBuyRefined && refinedSell > 0 && (
                        <ArrowDown className="w-3 h-3 text-success" />
                      )}
                    </div>
                  </td>
                  
                  {/* Refined Buy */}
                  <td className="py-2 px-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-mono text-xs ${isBestSellRefined ? 'text-primary font-bold' : refinedBuy === 0 ? 'text-muted-foreground' : ''}`}>
                        {formatPrice(refinedBuy)}
                      </span>
                      {isBestSellRefined && refinedBuy > 0 && (
                        <ArrowUp className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-3 h-3 text-success" />
          <span>Melhor preço para comprar (menor Sell Order)</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUp className="w-3 h-3 text-primary" />
          <span>Melhor preço para vender (maior Buy Order)</span>
        </div>
      </div>

      {citiesWithData.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>Nenhum dado disponível para este recurso.</p>
          <p className="text-xs mt-1">Os preços são coletados por jogadores usando o cliente de dados.</p>
        </div>
      )}
    </div>
  );
};
