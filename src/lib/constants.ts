import { GameLocation, Item } from './types';

export const ITEMS: Record<string, Item> = {
  water_bottle: { id: 'water_bottle', name: 'Bottled Water', type: 'water', description: 'Clean water, a rare commodity.', weight: 1.0, thirst: 30 },
  dirty_water: { id: 'dirty_water', name: 'Dirty Water', type: 'water', description: 'Might make you sick, but keeps you alive.', weight: 1.0, thirst: 15, health: -5 },
  canned_beans: { id: 'canned_beans', name: 'Canned Beans', type: 'food', description: 'Staple survival food.', weight: 0.5, hunger: 25 },
  stale_tortilla: { id: 'stale_tortilla', name: 'Stale Tortilla', type: 'food', description: 'Hard as a rock.', weight: 0.1, hunger: 10 },
  scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', type: 'material', description: 'Useful for crafting.', weight: 0.5 },
  rags: { id: 'rags', name: 'Rags', type: 'material', description: 'Torn clothing.', weight: 0.1 },
  bandages: { id: 'bandages', name: 'Makeshift Bandage', type: 'medical', description: 'Stops bleeding.', weight: 0.1, health: 20 },
  machete: { id: 'machete', name: 'Rusty Machete', type: 'weapon', description: 'Standard cartel tool.', weight: 1.5 },
  ammunition_9mm: { id: 'ammunition_9mm', name: '9mm Ammo', type: 'material', description: 'Currency and defense.', weight: 0.01 },
};

const createSubLocation = (id: string, name: string, lootPoolName: 'residential' | 'commercial' | 'police' | 'medical') => {
  const pools = {
    residential: [
      { itemId: 'dirty_water', chance: 0.6, maxQty: 2 },
      { itemId: 'stale_tortilla', chance: 0.5, maxQty: 3 },
      { itemId: 'rags', chance: 0.8, maxQty: 4 }
    ],
    commercial: [
      { itemId: 'water_bottle', chance: 0.4, maxQty: 2 },
      { itemId: 'canned_beans', chance: 0.4, maxQty: 2 },
      { itemId: 'scrap_metal', chance: 0.7, maxQty: 3 }
    ],
    police: [
      { itemId: 'ammunition_9mm', chance: 0.3, maxQty: 5 },
      { itemId: 'machete', chance: 0.1, maxQty: 1 },
      { itemId: 'scrap_metal', chance: 0.5, maxQty: 2 }
    ],
    medical: [
      { itemId: 'bandages', chance: 0.6, maxQty: 3 },
      { itemId: 'water_bottle', chance: 0.5, maxQty: 1 }
    ]
  };

  return {
    id,
    name,
    description: `A ruined ${name.toLowerCase()}.`,
    searched: false,
    lootPool: pools[lootPoolName],
    risk: lootPoolName === 'police' ? 0.4 : 0.2
  };
};

export const INITIAL_LOCATIONS: GameLocation[] = [
  {
    id: 'tijuana_outskirts',
    name: 'Tijuana Outskirts',
    x: 10, y: 10,
    type: 'ruins',
    subLocations: [
      createSubLocation('tj_house_1', 'Abandoned House', 'residential'),
      createSubLocation('tj_oxxo_1', 'Ruined Oxxo', 'commercial')
    ]
  },
  {
    id: 'tijuana_center',
    name: 'Tijuana Zona Centro',
    x: 12, y: 11,
    type: 'ruins',
    subLocations: [
      createSubLocation('tj_police', 'Federal Police Station', 'police'),
      createSubLocation('tj_clinic', 'Farmacia Similares', 'medical'),
      createSubLocation('tj_house_2', 'Collapsed Apartment', 'residential'),
      createSubLocation('tj_oxxo_2', 'Ruined Oxxo', 'commercial')
    ]
  },
  {
    id: 'cartel_checkpoint_alpha',
    name: 'Highway Checkpoint Alpha',
    x: 16, y: 10,
    type: 'cartel_base',
    subLocations: [
      createSubLocation('checkpoint_armory', 'Improvised Armory', 'police'),
      createSubLocation('checkpoint_tents', 'Guard Barracks', 'residential')
    ]
  },
  {
    id: 'sonoran_desert_road',
    name: 'La Rumorosa Highway',
    x: 20, y: 9,
    type: 'gas_station',
    subLocations: [
      createSubLocation('road_gas', 'Abandoned Pemex', 'commercial'),
      createSubLocation('road_crash', 'Crashed Convoy', 'police')
    ]
  },
  {
    id: 'mexicali_ruins',
    name: 'Mexicali Ruins',
    x: 25, y: 8,
    type: 'ruins',
    subLocations: [
      createSubLocation('mx_house_1', 'Burned House', 'residential'),
      createSubLocation('mx_clinic', 'Border Clinic', 'medical'),
      createSubLocation('mx_hideout', 'Smugglers Hideout', 'residential')
    ]
  },
  {
    id: 'nogales_border',
    name: 'Nogales Border Wall',
    x: 35, y: 8,
    type: 'safezone',
    subLocations: [
      createSubLocation('nog_camp', 'Refugee Camp', 'residential'),
      createSubLocation('nog_stashes', 'Smugglers Stashes', 'commercial'),
      createSubLocation('nog_patrol', 'Destroyed CBP SUV', 'police')
    ]
  },
  {
    id: 'sinaloa_mountains',
    name: 'Sinaloa Highlands',
    x: 40, y: 50,
    type: 'rural_mountains',
    subLocations: [
      createSubLocation('sin_camp', 'Hidden Cartel Camp', 'police'),
      createSubLocation('sin_shack', 'Abandoned Processing Shack', 'commercial'),
      createSubLocation('sin_mine', 'Old Mine Entrance', 'residential')
    ],
    landmarks: [
      { id: 'lm_cartel_ranch', name: 'El Patrón\'s Ranch', description: 'A fortified hacienda compound. Armed guards patrol the walls.', type: 'cartel_ranch', gridX: 12, gridY: 10 },
      { id: 'lm_rooster_pit_sin', name: 'La Arena de Gallos', description: 'Underground rooster fighting ring. Bets and blood.', type: 'rooster_pit', gridX: 38, gridY: 28 }
    ]
  },
  {
    id: 'michoacan_forest',
    name: 'Michoacán Sierra',
    x: 45, y: 65,
    type: 'rural_forest',
    subLocations: [
      createSubLocation('mich_farm', 'Avocado Farm Ruins', 'residential'),
      createSubLocation('mich_lab', 'Concealed Lab', 'medical'),
      createSubLocation('mich_road', 'Logging Road Checkpoint', 'police')
    ],
    landmarks: [
      { id: 'lm_drug_lab', name: 'Laboratorio Clandestino', description: 'Hidden drug laboratory deep in the sierra. Toxic fumes seep from the vents.', type: 'drug_lab', gridX: 14, gridY: 12 },
      { id: 'lm_rooster_pit_mich', name: 'Palenque del Pueblo', description: 'A rustic cockfighting arena. The crowd roars at night.', type: 'rooster_pit', gridX: 40, gridY: 30 }
    ]
  },
  {
    id: 'la_downtown',
    name: 'Los Angeles - Skid Row',
    x: 8, y: 35,
    type: 'city_la',
    subLocations: [
      createSubLocation('la_tent', 'Sprawling Tent City', 'residential'),
      createSubLocation('la_liquor', 'Looted Liquor Store', 'commercial'),
      createSubLocation('la_precinct', 'LAPD Precinct', 'police')
    ],
    landmarks: [
      { id: 'lm_gang_hq', name: 'East Side Warehouse', description: 'Fortified gang headquarters. Graffiti-covered walls and armed sentries.', type: 'gang_hq', gridX: 16, gridY: 14 }
    ]
  },
  {
    id: 'la_venice',
    name: 'Venice Beach Ruins',
    x: 6, y: 36,
    type: 'city_la',
    subLocations: [
      createSubLocation('la_boardwalk', 'Abandoned Boardwalk', 'commercial'),
      createSubLocation('la_clinic', 'Lifeguard Clinic', 'medical')
    ]
  },
  {
    id: 'vegas_strip',
    name: 'Las Vegas Strip',
    x: 55, y: 25,
    type: 'city_vegas',
    subLocations: [
      createSubLocation('lv_bellagio', 'Flooded Casino Resort', 'commercial'),
      createSubLocation('lv_pawn', 'Pawn Shop Vault', 'commercial'),
      createSubLocation('lv_swat', 'LVMPD SWAT Truck', 'police')
    ],
    landmarks: [
      { id: 'lm_casino', name: 'Casino Royale', description: 'A towering golden casino. Neon lights still flicker in the wasteland night.', type: 'casino', gridX: 20, gridY: 10 }
    ]
  }
];
