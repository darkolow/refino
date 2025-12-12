export const cities = [
  { id: 'caerleon', name: 'Caerleon', color: 'hsl(0, 70%, 50%)' },
  { id: 'bridgewatch', name: 'Bridgewatch', color: 'hsl(35, 80%, 50%)' },
  { id: 'fort-sterling', name: 'Fort Sterling', color: 'hsl(200, 70%, 50%)' },
  { id: 'lymhurst', name: 'Lymhurst', color: 'hsl(120, 50%, 40%)' },
  { id: 'martlock', name: 'Martlock', color: 'hsl(45, 70%, 50%)' },
  { id: 'thetford', name: 'Thetford', color: 'hsl(280, 50%, 50%)' },
] as const;

export type CityId = typeof cities[number]['id'];

export const resourceTypes = [
  { 
    id: 'ore', 
    name: 'Minério', 
    nameEn: 'Ore',
    refined: 'Barras de Metal',
    refinedEn: 'Metal Bars',
    icon: '⛏️',
    ratio: 2, // 2 raw = 1 refined
  },
  { 
    id: 'wood', 
    name: 'Madeira', 
    nameEn: 'Wood',
    refined: 'Tábuas',
    refinedEn: 'Planks',
    icon: '🪵',
    ratio: 2,
  },
  { 
    id: 'hide', 
    name: 'Couro Bruto', 
    nameEn: 'Hide',
    refined: 'Couro',
    refinedEn: 'Leather',
    icon: '🦌',
    ratio: 2,
  },
  { 
    id: 'fiber', 
    name: 'Fibra', 
    nameEn: 'Fiber',
    refined: 'Tecido',
    refinedEn: 'Cloth',
    icon: '🌿',
    ratio: 2,
  },
  { 
    id: 'stone', 
    name: 'Pedra', 
    nameEn: 'Stone',
    refined: 'Blocos de Pedra',
    refinedEn: 'Stone Blocks',
    icon: '🪨',
    ratio: 2,
  },
] as const;

export type ResourceId = typeof resourceTypes[number]['id'];

export const tiers = [
  { id: 't4', name: 'Tier 4', level: 4 },
  { id: 't5', name: 'Tier 5', level: 5 },
  { id: 't6', name: 'Tier 6', level: 6 },
  { id: 't7', name: 'Tier 7', level: 7 },
  { id: 't8', name: 'Tier 8', level: 8 },
] as const;

export type TierId = typeof tiers[number]['id'];

// Simulated price data - in a real app, this would come from Albion Data Project API
export const generateMockPrices = () => {
  const prices: Record<string, Record<CityId, { raw: number; refined: number }>> = {};
  
  resourceTypes.forEach(resource => {
    tiers.forEach(tier => {
      const key = `${resource.id}-${tier.id}`;
      const basePrice = tier.level * 100 + Math.random() * 200;
      
      prices[key] = {} as Record<CityId, { raw: number; refined: number }>;
      
      cities.forEach(city => {
        const cityVariation = 0.8 + Math.random() * 0.4;
        prices[key][city.id] = {
          raw: Math.round(basePrice * cityVariation),
          refined: Math.round(basePrice * 2.5 * cityVariation),
        };
      });
    });
  });
  
  return prices;
};

export type PriceData = ReturnType<typeof generateMockPrices>;
