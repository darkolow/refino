import { cities, resourceTypes, type ResourceId, type CityId, type ResourcePrice } from '@/data/albionData';
import { ArrowUp, ArrowDown, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    prices[city.id]?.raw > 0 || prices[city.id]?.refined > 0
  );

  // Find best buy (lowest non-zero) and best sell (highest)
  const rawPrices = citiesWithData
    .map(city => ({ city: city.id, price: prices[city.id].raw }))
    .filter(p => p.price > 0);
  const refinedPrices = citiesWithData
    .map(city => ({ city: city.id, price: prices[city.id].refined }))
    .filter(p => p.price > 0);

  const bestBuyRaw = rawPrices.length > 0 ? rawPrices.reduce((a, b) => a.price < b.price ? a : b) : null;
  const bestSellRaw = rawPrices.length > 0 ? rawPrices.reduce((a, b) => a.price > b.price ? a : b) : null;
  const bestBuyRefined = refinedPrices.length > 0 ? refinedPrices.reduce((a, b) => a.price < b.price ? a : b) : null;
  const bestSellRefined = refinedPrices.length > 0 ? refinedPrices.reduce((a, b) => a.price > b.price ? a : b) : null;

  const formatPrice = (price: number) => {
    if (price === 0) return '—';
    return price.toLocaleString('pt-BR');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch {
      return null;
    }
  };

  const getCityColor = (cityId: CityId) => {
    const city = cities.find(c => c.id === cityId);
    return city?.color || 'hsl(0, 0%, 50%)';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-display text-foreground">Cidade</th>
              <th className="text-right py-3 px-4 font-display text-foreground">
                {resource.name} <span className="text-muted-foreground text-xs">(Bruto)</span>
              </th>
              <th className="text-right py-3 px-4 font-display text-foreground">
                {resource.refined} <span className="text-muted-foreground text-xs">(Refinado)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, index) => {
              const rawPrice = prices[city.id]?.raw || 0;
              const refinedPrice = prices[city.id]?.refined || 0;
              const rawDate = prices[city.id]?.rawDate;
              const refinedDate = prices[city.id]?.refinedDate;
              
              const isBestBuyRaw = bestBuyRaw?.city === city.id;
              const isBestSellRaw = bestSellRaw?.city === city.id && bestSellRaw?.city !== bestBuyRaw?.city;
              const isBestBuyRefined = bestBuyRefined?.city === city.id;
              const isBestSellRefined = bestSellRefined?.city === city.id && bestSellRefined?.city !== bestBuyRefined?.city;

              return (
                <tr
                  key={city.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCityColor(city.id) }}
                      />
                      <span className="font-medium">{city.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-mono ${isBestBuyRaw ? 'text-success font-bold' : isBestSellRaw ? 'text-destructive' : rawPrice === 0 ? 'text-muted-foreground' : ''}`}>
                          {formatPrice(rawPrice)}
                        </span>
                        {isBestBuyRaw && rawPrice > 0 && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                            <ArrowDown className="w-3 h-3" /> Comprar
                          </span>
                        )}
                        {isBestSellRaw && rawPrice > 0 && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" /> Vender
                          </span>
                        )}
                      </div>
                      {rawDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(rawDate)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-mono ${isBestBuyRefined ? 'text-success font-bold' : isBestSellRefined ? 'text-destructive' : refinedPrice === 0 ? 'text-muted-foreground' : ''}`}>
                          {formatPrice(refinedPrice)}
                        </span>
                        {isBestBuyRefined && refinedPrice > 0 && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                            <ArrowDown className="w-3 h-3" /> Comprar
                          </span>
                        )}
                        {isBestSellRefined && refinedPrice > 0 && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" /> Vender
                          </span>
                        )}
                      </div>
                      {refinedDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(refinedDate)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
