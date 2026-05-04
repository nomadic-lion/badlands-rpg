import { useState, useCallback } from 'react';
import { GameState, ItemType, LogEntry } from '../lib/types';
import { INITIAL_LOCATIONS, ITEMS } from '../lib/constants';
import { RECIPES } from '../lib/crafting';

const INITIAL_STATE: GameState = {
  stats: {
    health: 100, maxHealth: 100,
    energy: 100, maxEnergy: 100,
    hunger: 100, maxHunger: 100,
    thirst: 100, maxThirst: 100,
  },
  inventory: {
    'water_bottle': 1,
    'stale_tortilla': 2,
    'rags': 1
  },
  currentLocationId: 'tijuana_outskirts',
  day: 1,
  hour: 8, // Start at 8 AM
  logs: [
    { id: '1', timestamp: Date.now(), message: 'Awoke in the outskirts of Tijuana. The cartels have burned everything. I need to survive.', type: 'warning' }
  ],
  locations: JSON.parse(JSON.stringify(INITIAL_LOCATIONS)), // Deep copy
  playerName: 'EL XOMAR',
};

const createLog = (message: string, type: LogEntry['type'] = 'info'): LogEntry => ({
  id: Math.random().toString(),
  timestamp: Date.now(),
  message,
  type
});

export const useGameState = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const passTime = useCallback((hours: number) => {
    setState(prev => {
      let newHour = prev.hour + hours;
      let newDay = prev.day;
      if (newHour >= 24) {
        newDay += Math.floor(newHour / 24);
        newHour = newHour % 24;
      }
      
      const newStats = { ...prev.stats };
      // Decay stats
      newStats.hunger = Math.max(0, newStats.hunger - (hours * 2));
      newStats.thirst = Math.max(0, newStats.thirst - (hours * 3));
      newStats.energy = Math.max(0, newStats.energy - (hours * 1));

      // Health decay if starving/dehydrated
      if (newStats.hunger === 0) newStats.health -= hours * 2;
      if (newStats.thirst === 0) newStats.health -= hours * 5;

      return { ...prev, day: newDay, hour: newHour, stats: newStats };
    });
  }, []);

  const searchLocation = useCallback((locationId: string, subLocationId: string) => {
    setState(prev => {
      const locIndex = prev.locations.findIndex(l => l.id === locationId);
      if (locIndex === -1) return prev;
      
      const loc = prev.locations[locIndex];
      const subLocIndex = loc.subLocations.findIndex(s => s.id === subLocationId);
      if (subLocIndex === -1 || loc.subLocations[subLocIndex].searched) return prev;
      
      // Cost of searching
      // if (prev.stats.energy < 10) return prev; // Cannot search

      const subLoc = loc.subLocations[subLocIndex];
      const newInventory = { ...prev.inventory };
      const foundItems: string[] = [];
      
      // Determine Combat Encounter
      let healthLost = 0;
      let combatLog = '';
      if (Math.random() < subLoc.risk) {
        // Combat triggered!
        const hasWeapon = prev.inventory['machete'] && prev.inventory['machete'] > 0;
        if (hasWeapon) {
          healthLost = Math.floor(Math.random() * 10) + 1; // 1-10
          combatLog = `Ambushed by thugs! Fought them off with your machete but lost ${healthLost} HP.`;
        } else {
          healthLost = Math.floor(Math.random() * 20) + 10; // 10-30
          combatLog = `Ambushed by thugs! Barely escaped with your life, lost ${healthLost} HP.`;
        }
      }

      // Generate loot if survived/fought
      subLoc.lootPool.forEach(pool => {
        if (Math.random() < pool.chance) {
          const qty = Math.floor(Math.random() * pool.maxQty) + 1;
          newInventory[pool.itemId] = (newInventory[pool.itemId] || 0) + qty;
          foundItems.push(`${qty}x ${ITEMS[pool.itemId]?.name || pool.itemId}`);
        }
      });

      // Update location
      const newLocations = [...prev.locations];
      newLocations[locIndex] = { ...loc, subLocations: [...loc.subLocations] };
      newLocations[locIndex].subLocations[subLocIndex] = { ...subLoc, searched: true };

      // Update logs
      const newLogs = [...prev.logs];
      if (combatLog) newLogs.unshift(createLog(combatLog, 'combat'));
      newLogs.unshift(createLog(`Searched ${subLoc.name}. Found: ${foundItems.length > 0 ? foundItems.join(', ') : 'Nothing useful.'}`, foundItems.length > 0 ? 'loot' : 'info'));

      return {
        ...prev,
        inventory: newInventory,
        locations: newLocations,
        logs: newLogs.slice(0, 50),
        stats: {
          ...prev.stats,
          health: Math.max(0, prev.stats.health - healthLost),
          energy: prev.stats.energy - 10,
          hunger: Math.max(0, prev.stats.hunger - 2),
          thirst: Math.max(0, prev.stats.thirst - 3)
        },
        hour: (prev.hour + 1) % 24,
        day: prev.hour + 1 >= 24 ? prev.day + 1 : prev.day
      };
    });
  }, []);

  const useItem = useCallback((itemId: string) => {
    setState(prev => {
      if (!prev.inventory[itemId] || prev.inventory[itemId] <= 0) return prev;
      
      const item = ITEMS[itemId];
      if (!item) return prev;

      if (!item.health && !item.hunger && !item.thirst && !item.energy) {
         addLog(`Cannot use ${item.name} like this.`, 'warning');
         return prev;
      }

      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= 1;
      if (newInventory[itemId] === 0) delete newInventory[itemId];

      const newStats = { ...prev.stats };
      if (item.health) newStats.health = Math.min(newStats.maxHealth, newStats.health + item.health);
      if (item.hunger) newStats.hunger = Math.min(newStats.maxHunger, newStats.hunger + item.hunger);
      if (item.thirst) newStats.thirst = Math.min(newStats.maxThirst, newStats.thirst + item.thirst);
      if (item.energy) newStats.energy = Math.min(newStats.maxEnergy, newStats.energy + item.energy);

      const newLogs = [createLog(`Consumed ${item.name}.`, 'info'), ...prev.logs].slice(0, 50);

      return {
        ...prev,
        inventory: newInventory,
        stats: newStats,
        logs: newLogs
      };
    });
  }, []);

  const travel = useCallback((destinationId: string) => {
    setState(prev => {
      const currentLoc = prev.locations.find(l => l.id === prev.currentLocationId);
      const destLoc = prev.locations.find(l => l.id === destinationId);
      if (!currentLoc || !destLoc) return prev;

      // Simple distance calc
      const distance = Math.sqrt(Math.pow(destLoc.x - currentLoc.x, 2) + Math.pow(destLoc.y - currentLoc.y, 2));
      const hoursTaken = Math.max(1, Math.floor(distance));
      const energyCost = hoursTaken * 5;

      // if (prev.stats.energy < energyCost) {
      //   addLog(`Too exhausted to travel to ${destLoc.name}. Need to rest.`, 'warning');
      //   return prev;
      // }

      const newLogs = [createLog(`Traveled to ${destLoc.name}. Took ${hoursTaken} hours.`, 'info'), ...prev.logs].slice(0, 50);
      
      let newHour = prev.hour + hoursTaken;
      let newDay = prev.day;
      if (newHour >= 24) {
        newDay += Math.floor(newHour / 24);
        newHour = newHour % 24;
      }

      return {
        ...prev,
        currentLocationId: destinationId,
        hour: newHour,
        day: newDay,
        logs: newLogs,
        stats: {
          ...prev.stats,
          // energy: prev.stats.energy - energyCost,
          hunger: Math.max(0, prev.stats.hunger - (hoursTaken * 2)),
          thirst: Math.max(0, prev.stats.thirst - (hoursTaken * 3)),
        }
      };
    });
  }, []);

  const rest = useCallback(() => {
    setState(prev => {
      let newHour = prev.hour + 8;
      let newDay = prev.day;
      if (newHour >= 24) {
        newDay += Math.floor(newHour / 24);
        newHour = newHour % 24;
      }

      const newStats = { ...prev.stats };
      newStats.energy = Math.min(newStats.maxEnergy, newStats.energy + 50);
      newStats.hunger = Math.max(0, newStats.hunger - 16);
      newStats.thirst = Math.max(0, newStats.thirst - 24);

      if (newStats.hunger === 0) newStats.health -= 15;
      if (newStats.thirst === 0) newStats.health -= 30;

      // Small natural healing if well fed and watered
      if (newStats.hunger > 50 && newStats.thirst > 50) {
        newStats.health = Math.min(newStats.maxHealth, newStats.health + 10);
      }

      const newLogs = [createLog('Rested for 8 hours.', 'info'), ...prev.logs].slice(0, 50);

      return {
        ...prev,
        day: newDay,
        hour: newHour,
        stats: newStats,
        logs: newLogs
      };
    });
  }, []);

  const craftItem = useCallback((recipeId: string) => {
    setState(prev => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return prev;

      // Check if we have the inputs
      for (const [itemId, qty] of Object.entries(recipe.inputs)) {
        if (!prev.inventory[itemId] || prev.inventory[itemId] < (qty as number)) {
          addLog(`Not enough materials to craft ${recipe.name}.`, 'warning');
          return prev;
        }
      }

      // Check energy
      if (prev.stats.energy < 15) {
        addLog(`Too exhausted to craft.`, 'warning');
        return prev;
      }

      const newInventory = { ...prev.inventory };
      
      // Consume inputs
      for (const [itemId, qty] of Object.entries(recipe.inputs)) {
        newInventory[itemId] -= (qty as number);
        if (newInventory[itemId] <= 0) delete newInventory[itemId];
      }

      // Add output
      newInventory[recipe.outputId] = (newInventory[recipe.outputId] || 0) + recipe.outputQty;

      const newLogs = [createLog(`Crafted ${recipe.outputQty}x ${ITEMS[recipe.outputId]?.name || recipe.outputId}.`, 'info'), ...prev.logs].slice(0, 50);

      return {
        ...prev,
        inventory: newInventory,
        logs: newLogs,
        stats: {
          ...prev.stats,
          energy: prev.stats.energy - 15, // Cost of crafting
          hunger: Math.max(0, prev.stats.hunger - 2),
          thirst: Math.max(0, prev.stats.thirst - 2)
        },
        hour: (prev.hour + 1) % 24,
        day: prev.hour + 1 >= 24 ? prev.day + 1 : prev.day
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, searchLocation, useItem, travel, rest, craftItem, resetGame };
};
