export const cities = [
  { id: 'Caerleon', name: 'Caerleon', color: 'hsl(0, 70%, 50%)' },
  { id: 'Bridgewatch', name: 'Bridgewatch', color: 'hsl(35, 80%, 50%)' },
  { id: 'Fort Sterling', name: 'Fort Sterling', color: 'hsl(200, 70%, 50%)' },
  { id: 'Lymhurst', name: 'Lymhurst', color: 'hsl(120, 50%, 40%)' },
  { id: 'Martlock', name: 'Martlock', color: 'hsl(45, 70%, 50%)' },
  { id: 'Thetford', name: 'Thetford', color: 'hsl(280, 50%, 50%)' },
] as const;

export type CityId = typeof cities[number]['id'];

export const resourceTypes = [
  { 
    id: 'ORE', 
    name: 'Minério', 
    nameEn: 'Ore',
    refined: 'Barras de Metal',
    refinedId: 'METALBAR',
    refinedEn: 'Metal Bars',
    icon: '⛏️',
    ratio: 2,
  },
  { 
    id: 'WOOD', 
    name: 'Madeira', 
    nameEn: 'Wood',
    refined: 'Tábuas',
    refinedId: 'PLANKS',
    refinedEn: 'Planks',
    icon: '🪵',
    ratio: 2,
  },
  { 
    id: 'HIDE', 
    name: 'Couro Bruto', 
    nameEn: 'Hide',
    refined: 'Couro',
    refinedId: 'LEATHER',
    refinedEn: 'Leather',
    icon: '🦌',
    ratio: 2,
  },
  { 
    id: 'FIBER', 
    name: 'Fibra', 
    nameEn: 'Fiber',
    refined: 'Tecido',
    refinedId: 'CLOTH',
    refinedEn: 'Cloth',
    icon: '🌿',
    ratio: 2,
  },
  { 
    id: 'ROCK', 
    name: 'Pedra', 
    nameEn: 'Stone',
    refined: 'Blocos de Pedra',
    refinedId: 'STONEBLOCK',
    refinedEn: 'Stone Blocks',
    icon: '🪨',
    ratio: 2,
  },
] as const;

export type ResourceId = typeof resourceTypes[number]['id'];

export const tiers = [
  { id: 'T4', name: 'Tier 4', level: 4 },
  { id: 'T5', name: 'Tier 5', level: 5 },
  { id: 'T6', name: 'Tier 6', level: 6 },
  { id: 'T7', name: 'Tier 7', level: 7 },
  { id: 'T8', name: 'Tier 8', level: 8 },
] as const;

export type TierId = typeof tiers[number]['id'];

export const servers = [
  { id: 'west', name: 'Americas', url: 'https://west.albion-online-data.com' },
  { id: 'europe', name: 'Europe', url: 'https://europe.albion-online-data.com' },
  { id: 'east', name: 'Asia', url: 'https://east.albion-online-data.com' },
] as const;

export type ServerId = typeof servers[number]['id'];

// API response type
export interface AlbionPriceData {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

// Parsed price data for our app
export interface ResourcePrice {
  raw: number;
  refined: number;
  rawDate?: string;
  refinedDate?: string;
}

export type PriceData = Record<string, Record<CityId, ResourcePrice>>;

// Build item ID for API call
export const getItemIds = (resourceId: ResourceId, tierId: TierId) => {
  const resource = resourceTypes.find(r => r.id === resourceId)!;
  const rawId = `${tierId}_${resourceId}`;
  const refinedId = `${tierId}_${resource.refinedId}`;
  return { rawId, refinedId };
};

// Fetch prices from Albion Data Project API
export const fetchPrices = async (
  resourceId: ResourceId,
  tierId: TierId,
  serverId: ServerId = 'west'
): Promise<Record<CityId, ResourcePrice>> => {
  const server = servers.find(s => s.id === serverId)!;
  const { rawId, refinedId } = getItemIds(resourceId, tierId);
  const locations = cities.map(c => c.id).join(',');
  
  const url = `${server.url}/api/v2/stats/prices/${rawId},${refinedId}.json?locations=${locations}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: AlbionPriceData[] = await response.json();
    
    // Parse API response into our format
    const prices: Record<CityId, ResourcePrice> = {} as Record<CityId, ResourcePrice>;
    
    cities.forEach(city => {
      prices[city.id] = { raw: 0, refined: 0 };
    });
    
    data.forEach(item => {
      const cityId = item.city as CityId;
      if (!prices[cityId]) return;
      
      const price = item.sell_price_min || item.buy_price_max || 0;
      const date = item.sell_price_min_date || item.buy_price_max_date;
      
      if (item.item_id === rawId) {
        prices[cityId].raw = price;
        prices[cityId].rawDate = date;
      } else if (item.item_id === refinedId) {
        prices[cityId].refined = price;
        prices[cityId].refinedDate = date;
      }
    });
    
    return prices;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw error;
  }
};

// Fetch all prices for all tiers of a resource
export const fetchAllPrices = async (
  resourceId: ResourceId,
  serverId: ServerId = 'west'
): Promise<PriceData> => {
  const allPrices: PriceData = {};
  
  const fetchPromises = tiers.map(async (tier) => {
    try {
      const prices = await fetchPrices(resourceId, tier.id, serverId);
      const key = `${resourceId}-${tier.id}`;
      allPrices[key] = prices;
    } catch (error) {
      console.error(`Failed to fetch ${tier.id} prices:`, error);
      // Set empty prices for failed fetches
      const key = `${resourceId}-${tier.id}`;
      allPrices[key] = {} as Record<CityId, ResourcePrice>;
      cities.forEach(city => {
        allPrices[key][city.id] = { raw: 0, refined: 0 };
      });
    }
  });
  
  await Promise.all(fetchPromises);
  return allPrices;
};
