import React, { useState, useMemo } from 'react';
import { 
  cities, 
  resourceTypes, 
  tiers,
  type ResourceId, 
  type CityId, 
  type TierId,
  type PriceData 
} from '@/data/albionData';
import { Flame, TrendingUp, Settings, Percent } from 'lucide-react';

interface RefiningCalculatorProps {
  selectedResource: ResourceId;
  allPrices: PriceData;
  isLoading: boolean;
}

// Refining recipes: T2 = 1 raw, T3+ = 2 raw + 1 previous tier refined
const getRefiningRecipe = (tier: TierId) => {
  const tierNum = parseInt(tier.replace('T', ''));
  if (tierNum === 2) {
    return { rawNeeded: 1, previousRefinedNeeded: 0 };
  }
  return { rawNeeded: 2, previousRefinedNeeded: 1 };
};

// Return rate percentages based on city bonuses and focus
const RETURN_RATES = {
  noFocus: {
    base: 15,
    cityBonus: 37, // ~36.7% with city bonus
  },
  withFocus: {
    base: 44,
    cityBonus: 53,
  }
};

// City refining bonuses (which resource gets bonus in which city)
const CITY_REFINING_BONUS: Record<string, ResourceId> = {
  'Martlock': 'HIDE',
  'Bridgewatch': 'ROCK',
  'Lymhurst': 'FIBER',
  'Fort Sterling': 'WOOD',
  'Thetford': 'ORE',
};

export const RefiningCalculator = ({ selectedResource, allPrices, isLoading }: RefiningCalculatorProps) => {
  const [selectedTier, setSelectedTier] = useState<TierId>('T4');
  const [city, setCity] = useState<CityId>('Thetford');
  const [quantity, setQuantity] = useState(100);
  const [useFocus, setUseFocus] = useState(true);
  const [stationFee, setStationFee] = useState(15); // percentage

  const resource = resourceTypes.find(r => r.id === selectedResource)!;

  // Check if city has bonus for this resource
  const hasCityBonus = CITY_REFINING_BONUS[city] === selectedResource;

  // Calculate return rate
  const returnRate = useMemo(() => {
    if (useFocus) {
      return hasCityBonus ? RETURN_RATES.withFocus.cityBonus : RETURN_RATES.withFocus.base;
    }
    return hasCityBonus ? RETURN_RATES.noFocus.cityBonus : RETURN_RATES.noFocus.base;
  }, [useFocus, hasCityBonus]);

  const calculation = useMemo(() => {
    const tierIndex = tiers.findIndex(t => t.id === selectedTier);
    if (tierIndex === -1) return null;

    const currentTier = tiers[tierIndex];
    const previousTier = tierIndex > 0 ? tiers[tierIndex - 1] : null;
    const recipe = getRefiningRecipe(currentTier.id);

    // Get prices for current tier
    const currentKey = `${selectedResource}-${currentTier.id}`;
    const currentPrices = allPrices[currentKey];
    if (!currentPrices || !currentPrices[city]) return null;

    // Get raw price (what we need to buy)
    const rawPrice = currentPrices[city].raw || 0;
    // Get refined price (what we'll sell)
    const refinedSellPrice = currentPrices[city].refined || 0;

    // Get previous tier refined price if needed
    let previousRefinedPrice = 0;
    if (recipe.previousRefinedNeeded > 0 && previousTier) {
      const prevKey = `${selectedResource}-${previousTier.id}`;
      const prevPrices = allPrices[prevKey];
      if (prevPrices && prevPrices[city]) {
        previousRefinedPrice = prevPrices[city].refined || 0;
      }
    }

    if (rawPrice === 0 || refinedSellPrice === 0) return null;
    if (recipe.previousRefinedNeeded > 0 && previousRefinedPrice === 0) return null;

    // Calculate effective cost considering return rate
    // With return rate, you get some materials back, so you need fewer inputs
    const effectiveReturnMultiplier = 1 / (1 - returnRate / 100);
    
    // Raw materials needed per refined output (before return rate)
    const baseRawPerOutput = recipe.rawNeeded;
    const basePrevRefinedPerOutput = recipe.previousRefinedNeeded;

    // Effective materials per output (after return rate applied to refined output)
    // Return rate gives you extra refined output, not raw materials back
    const effectiveRawPerOutput = baseRawPerOutput / effectiveReturnMultiplier;
    const effectivePrevRefinedPerOutput = basePrevRefinedPerOutput / effectiveReturnMultiplier;

    // Cost per refined unit
    const rawCostPerUnit = effectiveRawPerOutput * rawPrice;
    const prevRefinedCostPerUnit = effectivePrevRefinedPerOutput * previousRefinedPrice;
    const materialCostPerUnit = rawCostPerUnit + prevRefinedCostPerUnit;

    // Station fee (based on material cost)
    const stationFeePerUnit = (materialCostPerUnit * stationFee) / 100;

    // Total cost per unit
    const totalCostPerUnit = materialCostPerUnit + stationFeePerUnit;

    // Profit calculation
    const profitPerUnit = refinedSellPrice - totalCostPerUnit;
    const profitPercent = totalCostPerUnit > 0 ? ((profitPerUnit / totalCostPerUnit) * 100) : 0;

    // Total calculations
    const totalMaterialCost = materialCostPerUnit * quantity;
    const totalStationFee = stationFeePerUnit * quantity;
    const totalCost = totalCostPerUnit * quantity;
    const totalRevenue = refinedSellPrice * quantity;
    const totalProfit = profitPerUnit * quantity;

    // Raw materials actually consumed for quantity (before return rate benefit)
    const rawMaterialsNeeded = Math.ceil(baseRawPerOutput * quantity / effectiveReturnMultiplier);
    const prevRefinedNeeded = Math.ceil(basePrevRefinedPerOutput * quantity / effectiveReturnMultiplier);

    return {
      rawPrice,
      refinedSellPrice,
      previousRefinedPrice,
      recipe,
      previousTier,
      rawMaterialsNeeded,
      prevRefinedNeeded,
      materialCostPerUnit,
      stationFeePerUnit,
      totalCostPerUnit,
      profitPerUnit,
      profitPercent,
      totalMaterialCost,
      totalStationFee,
      totalCost,
      totalRevenue,
      totalProfit,
    };
  }, [selectedResource, selectedTier, city, quantity, stationFee, returnRate, allPrices]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatPrice = (price: number) => Math.round(price).toLocaleString('pt-BR');
  const getCityBonusResource = (cityId: CityId) => CITY_REFINING_BONUS[cityId];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg">Calculadora de Refino</h3>
      </div>

      {/* Controls */}
      <div className="grid gap-4">
        {/* Tier Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Tier</label>
          <div className="flex gap-1 flex-wrap">
            {tiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedTier === tier.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {tier.id}
              </button>
            ))}
          </div>
        </div>

        {/* City Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Cidade de Refino
            {hasCityBonus && (
              <span className="ml-2 text-success text-xs">✓ Bônus para {resource.name}</span>
            )}
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as CityId)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            {cities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {getCityBonusResource(c.id) === selectedResource ? '⭐' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity & Settings Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Quantidade</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
              <Settings className="w-3 h-3" /> Taxa da Estação (%)
            </label>
            <input
              type="number"
              value={stationFee}
              onChange={(e) => setStationFee(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Focus Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">Usar Focus</span>
          </div>
          <button
            onClick={() => setUseFocus(!useFocus)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              useFocus ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                useFocus ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Return Rate Display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Percent className="w-4 h-4" />
          <span>Taxa de Retorno: <span className="text-primary font-medium">{returnRate}%</span></span>
          {hasCityBonus && <span className="text-success">(com bônus da cidade)</span>}
        </div>
      </div>

      {/* Recipe Display */}
      {calculation && (
        <div className="p-4 rounded-lg border border-border bg-secondary/30">
          <div className="text-sm text-muted-foreground mb-2">Receita para {selectedTier} {resource.refined}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground font-medium">
              {calculation.rawMaterialsNeeded}x {selectedTier} {resource.name}
            </span>
            {calculation.previousTier && (
              <>
                <span className="text-muted-foreground">+</span>
                <span className="text-foreground font-medium">
                  {calculation.prevRefinedNeeded}x {calculation.previousTier.id} {resource.refined}
                </span>
              </>
            )}
            <span className="text-muted-foreground">→</span>
            <span className="text-primary font-medium">{quantity}x {selectedTier} {resource.refined}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {calculation ? (
        <div className="space-y-4">
          {/* Cost Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg card-gradient border border-border">
              <div className="text-xs text-muted-foreground mb-1">Custo Materiais</div>
              <div className="font-display text-foreground">{formatPrice(calculation.totalMaterialCost)}</div>
            </div>
            <div className="p-3 rounded-lg card-gradient border border-border">
              <div className="text-xs text-muted-foreground mb-1">Taxa Estação</div>
              <div className="font-display text-foreground">{formatPrice(calculation.totalStationFee)}</div>
            </div>
          </div>

          {/* Main Results */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg card-gradient border border-border">
              <div className="text-xs text-muted-foreground mb-1">Custo Total</div>
              <div className="font-display text-lg text-destructive">{formatPrice(calculation.totalCost)}</div>
              <div className="text-xs text-muted-foreground">{formatPrice(calculation.totalCostPerUnit)}/un</div>
            </div>

            <div className="p-3 rounded-lg card-gradient border border-border">
              <div className="text-xs text-muted-foreground mb-1">Receita Venda</div>
              <div className="font-display text-lg text-foreground">{formatPrice(calculation.totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">{formatPrice(calculation.refinedSellPrice)}/un</div>
            </div>

            <div className={`p-3 rounded-lg border ${calculation.totalProfit >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
              <div className="text-xs text-muted-foreground mb-1">Lucro</div>
              <div className={`font-display text-lg ${calculation.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {calculation.totalProfit >= 0 ? '+' : ''}{formatPrice(calculation.totalProfit)}
              </div>
              <div className={`text-xs ${calculation.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {calculation.profitPercent >= 0 ? '+' : ''}{calculation.profitPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Preço {selectedTier} {resource.name}: {formatPrice(calculation.rawPrice)}</div>
            {calculation.previousTier && (
              <div>Preço {calculation.previousTier.id} {resource.refined}: {formatPrice(calculation.previousRefinedPrice)}</div>
            )}
            <div>Preço {selectedTier} {resource.refined}: {formatPrice(calculation.refinedSellPrice)}</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>Preços não disponíveis para calcular o refino.</p>
          <p className="text-xs mt-1">Selecione outro tier ou cidade.</p>
        </div>
      )}
    </div>
  );
};
