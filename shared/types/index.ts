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

// Demo resource for the column-groups showcase (pages/orders.vue). The shape is
// intentionally NESTED so it maps 1:1 onto the grouped table headers: each nested
// object (customer / shipping / payment) becomes a header group, and its fields
// become the leaf columns (addressed by dotted accessorKeys like `customer.name`).
export interface Order {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  customer: { name: string; country: string };
  shipping: { carrier: string; status: 'pending' | 'shipped' | 'delivered' | 'cancelled'; eta: string };
  payment: { method: 'card' | 'paypal' | 'bank'; total: number; currency: string; paid: boolean };
}
