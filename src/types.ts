export type AppScreen = 'onboarding' | 'home' | 'lists' | 'list-detail' | 'family' | 'settings' | 'recipes' | 'recipe-detail' | 'pantry';

export interface SavedRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  ingredients: { name: string, quantity: string, category: string }[];
  instructions: string[];
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  isUrgent?: boolean;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  itemCount: number;
  completedCount?: number;
  lastEdited: string;
  color: string;
  icon: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Admin' | 'Membro';
  avatar: string;
  email: string;
}

export interface Activity {
  id: string;
  userName: string;
  action: string;
  target: string;
  createdAt: Date;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
}
