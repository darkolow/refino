import { useState, useMemo } from 'react';
import { cities, resourceTypes, type ResourceId, type TierId, type PriceData, type CityId } from '@/data/albionData';
import { TrendingUp, ArrowRight, Coins } from 'lucide-react';

interface ProfitCalculatorProps {
  selectedResource: ResourceId;
  selectedTier: TierId;
  prices: PriceData;
}

export const ProfitCalculator = ({ selectedResource, selectedTier, prices }: ProfitCalculatorProps) => {
  const [quantity, setQuantity] = useState(100);
  const [buyCity, setBuyCity] = useState<CityId>('caerleon');
  const [sellCity, setSellCity] = useState<CityId>('bridgewatch');
  const [mode, setMode] = useState<'raw' | 'refined'>('raw');

  const key = `${selectedResource}-${selectedTier}`;
  const resourcePrices = prices[key];
  const resource = resourceTypes.find(r => r.id === selectedResource)!;

  const calculation = useMemo(() => {
    if (!resourcePrices) return null;

    const buyPrice = mode === 'raw' ? resourcePrices[buyCity].raw : resourcePrices[buyCity].refined;
    const sellPrice = mode === 'raw' ? resourcePrices[sellCity].raw : resourcePrices[sellCity].refined;
    
    const totalBuy = buyPrice * quantity;
    const totalSell = sellPrice * quantity;
    const profit = totalSell - totalBuy;
    const profitPercent = ((profit / totalBuy) * 100).toFixed(1);

    return {
      buyPrice,
      sellPrice,
      totalBuy,
      totalSell,
      profit,
      profitPercent,
    };
  }, [resourcePrices, buyCity, sellCity, quantity, mode]);

  // Find best trade route
  const bestRoute = useMemo(() => {
    if (!resourcePrices) return null;

    let best = { buy: '' as CityId, sell: '' as CityId, profit: -Infinity, mode: 'raw' as 'raw' | 'refined' };

    cities.forEach(buyC => {
      cities.forEach(sellC => {
        if (buyC.id !== sellC.id) {
          // Check raw
          const rawProfit = resourcePrices[sellC.id].raw - resourcePrices[buyC.id].raw;
          if (rawProfit > best.profit) {
            best = { buy: buyC.id, sell: sellC.id, profit: rawProfit, mode: 'raw' };
          }
          // Check refined
          const refinedProfit = resourcePrices[sellC.id].refined - resourcePrices[buyC.id].refined;
          if (refinedProfit > best.profit) {
            best = { buy: buyC.id, sell: sellC.id, profit: refinedProfit, mode: 'refined' };
          }
        }
      });
    });

    return best;
  }, [resourcePrices]);

  if (!calculation || !resourcePrices) return null;

  const formatPrice = (price: number) => price.toLocaleString('pt-BR');
  const getCityName = (id: CityId) => cities.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      {/* Best Route Recommendation */}
      {bestRoute && bestRoute.profit > 0 && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 animate-pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-display text-primary">Melhor Rota</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Compre <span className="text-foreground font-medium">{bestRoute.mode === 'raw' ? resource.name : resource.refined}</span> em{' '}
            <span className="text-primary font-medium">{getCityName(bestRoute.buy)}</span> e venda em{' '}
            <span className="text-success font-medium">{getCityName(bestRoute.sell)}</span> para lucro de{' '}
            <span className="text-success font-bold">{formatPrice(bestRoute.profit)}</span> por unidade
          </p>
        </div>
      )}

      {/* Calculator Controls */}
      <div className="grid gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('raw')}
            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-all ${
              mode === 'raw'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
            }`}
          >
            {resource.name}
          </button>
          <button
            onClick={() => setMode('refined')}
            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-all ${
              mode === 'refined'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
            }`}
          >
            {resource.refined}
          </button>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Quantidade</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Comprar em</label>
            <select
              value={buyCity}
              onChange={(e) => setBuyCity(e.target.value as CityId)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-5 h-5 text-muted-foreground mb-2" />

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Vender em</label>
            <select
              value={sellCity}
              onChange={(e) => setSellCity(e.target.value as CityId)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg card-gradient border border-border">
          <div className="text-sm text-muted-foreground mb-1">Custo Total</div>
          <div className="font-display text-lg text-destructive">{formatPrice(calculation.totalBuy)}</div>
          <div className="text-xs text-muted-foreground">{formatPrice(calculation.buyPrice)}/un</div>
        </div>

        <div className="p-4 rounded-lg card-gradient border border-border">
          <div className="text-sm text-muted-foreground mb-1">Venda Total</div>
          <div className="font-display text-lg text-foreground">{formatPrice(calculation.totalSell)}</div>
          <div className="text-xs text-muted-foreground">{formatPrice(calculation.sellPrice)}/un</div>
        </div>

        <div className={`p-4 rounded-lg border ${calculation.profit >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <Coins className="w-4 h-4" /> Lucro
          </div>
          <div className={`font-display text-lg ${calculation.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {calculation.profit >= 0 ? '+' : ''}{formatPrice(calculation.profit)}
          </div>
          <div className={`text-xs ${calculation.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {calculation.profit >= 0 ? '+' : ''}{calculation.profitPercent}%
          </div>
        </div>
      </div>
    </div>
  );
};
