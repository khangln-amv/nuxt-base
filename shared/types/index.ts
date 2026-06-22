import type { UserRole } from '../utils/roles';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  role: UserRole;
}

// Partial update (PATCH): any subset of fields.
export interface UserUpdateData {
  name?: string;
  email?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Demo resource for the data-fetching showcase (pages/products.vue).
export interface Product {
  id: string;
  name: string;
  price: number;
}
