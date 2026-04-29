import { Item } from './types';

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  inputs: Record<string, number>;
  outputId: string;
  outputQty: number;
}

export const RECIPES: CraftingRecipe[] = [
  {
    id: 'boil_water',
    name: 'Boil Water',
    description: 'Purify dirty water using rags for filtration and minimal heat.',
    inputs: { dirty_water: 1, rags: 1 },
    outputId: 'water_bottle',
    outputQty: 1
  },
  {
    id: 'bandage',
    name: 'Makeshift Bandage',
    description: 'Tear rags down to clean bandages.',
    inputs: { rags: 2 },
    outputId: 'bandages',
    outputQty: 1
  },
  {
    id: 'shiv',
    name: 'Scrap Shiv',
    description: 'A sharp piece of metal.',
    inputs: { scrap_metal: 2, rags: 1 },
    outputId: 'machete', // Reusing machete for now or create generic shank
    outputQty: 1
  }
];
