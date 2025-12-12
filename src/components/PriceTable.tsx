import { cities, resourceTypes, type ResourceId, type TierId, type PriceData, type CityId } from '@/data/albionData';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PriceTableProps {
  selectedResource: ResourceId;
  selectedTier: TierId;
  prices: PriceData;
}

export const PriceTable = ({ selectedResource, selectedTier, prices }: PriceTableProps) => {
  const key = `${selectedResource}-${selectedTier}`;
  const resourcePrices = prices[key];
  const resource = resourceTypes.find(r => r.id === selectedResource)!;

  if (!resourcePrices) return null;

  // Find best buy (lowest) and best sell (highest)
  const rawPrices = cities.map(city => ({ city: city.id, price: resourcePrices[city.id].raw }));
  const refinedPrices = cities.map(city => ({ city: city.id, price: resourcePrices[city.id].refined }));

  const bestBuyRaw = rawPrices.reduce((a, b) => a.price < b.price ? a : b);
  const bestSellRaw = rawPrices.reduce((a, b) => a.price > b.price ? a : b);
  const bestBuyRefined = refinedPrices.reduce((a, b) => a.price < b.price ? a : b);
  const bestSellRefined = refinedPrices.reduce((a, b) => a.price > b.price ? a : b);

  const formatPrice = (price: number) => price.toLocaleString('pt-BR');

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
              const rawPrice = resourcePrices[city.id].raw;
              const refinedPrice = resourcePrices[city.id].refined;
              const isBestBuyRaw = city.id === bestBuyRaw.city;
              const isBestSellRaw = city.id === bestSellRaw.city;
              const isBestBuyRefined = city.id === bestBuyRefined.city;
              const isBestSellRefined = city.id === bestSellRefined.city;

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
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono ${isBestBuyRaw ? 'text-success font-bold' : isBestSellRaw ? 'text-destructive' : ''}`}>
                        {formatPrice(rawPrice)}
                      </span>
                      {isBestBuyRaw && (
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> Comprar
                        </span>
                      )}
                      {isBestSellRaw && (
                        <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" /> Vender
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono ${isBestBuyRefined ? 'text-success font-bold' : isBestSellRefined ? 'text-destructive' : ''}`}>
                        {formatPrice(refinedPrice)}
                      </span>
                      {isBestBuyRefined && (
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> Comprar
                        </span>
                      )}
                      {isBestSellRefined && (
                        <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" /> Vender
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
    </div>
  );
};
