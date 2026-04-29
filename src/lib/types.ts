export type ItemType = 'food' | 'water' | 'material' | 'weapon' | 'medical';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  weight: number;
  // effects when consumed
  health?: number;
  energy?: number;
  hunger?: number;
  thirst?: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
}

export interface SubLocation {
  id: string;
  name: string;
  description: string;
  searched: boolean;
  lootPool: { itemId: string; chance: number; maxQty: number }[];
  risk: number; // chance of encounter
}

export type LandmarkType = 'drug_lab' | 'cartel_ranch' | 'casino' | 'gang_hq' | 'rooster_pit';

export interface LandmarkBuilding {
  id: string;
  name: string;
  description: string;
  type: LandmarkType;
  gridX: number;
  gridY: number;
}

export interface GameLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'ruins' | 'cartel_base' | 'safezone' | 'gas_station' | 'rural_mountains' | 'rural_forest' | 'city_la' | 'city_vegas';
  subLocations: SubLocation[];
  landmarks?: LandmarkBuilding[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'loot' | 'combat';
}

export interface GameState {
  stats: PlayerStats;
  inventory: Record<string, number>;
  currentLocationId: string;
  day: number;
  hour: number;
  logs: LogEntry[];
  locations: GameLocation[];
}
