// In-memory order store for the column-groups demo (pages/orders.vue).
// Read-only — the demo only searches/lists (paginated, mirroring usersStore).
// Resets on server restart (no database).

const CUSTOMERS: Order['customer'][] = [
  { name: 'Akira Tanaka', country: 'JP' },
  { name: 'Emma Johnson', country: 'US' },
  { name: 'Liam Smith', country: 'GB' },
  { name: 'Sofia Rossi', country: 'IT' },
  { name: 'Lucas Martin', country: 'FR' },
  { name: 'Mai Nguyen', country: 'VN' },
  { name: 'Noah Kim', country: 'KR' },
  { name: 'Olivia Chen', country: 'CN' },
  { name: 'Elena García', country: 'ES' },
  { name: 'Hiroshi Sato', country: 'JP' },
  { name: 'Ava Wilson', country: 'AU' },
  { name: 'Mateo Silva', country: 'BR' },
  { name: 'Freya Andersen', country: 'DK' },
  { name: 'Omar Haddad', country: 'AE' },
];
const CARRIERS = ['DHL', 'UPS', 'FedEx', 'Yamato', 'DPD'];
const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'] as const;
const METHODS = ['card', 'paypal', 'bank'] as const;

// 26 orders (> the default page size of 20) so pagination has a second page.
const COUNT = 26;

const seed = (): Order[] => Array.from({ length: COUNT }, (_, i) => {
  // Modulo keeps every index in-bounds, so the non-null assertions are safe
  // (needed only because tsconfig has `noUncheckedIndexedAccess`).
  const customer = CUSTOMERS[i % CUSTOMERS.length]!;
  const currency = customer.country === 'JP' ? 'JPY' : 'USD';
  const placedDay = 1 + ((i * 5) % 27);
  const etaDay = Math.min(placedDay + 4 + (i % 5), 30);
  // Deterministic pseudo-amounts so the table has varied, stable values.
  const usd = 39 + ((i * 173) % 860);
  return {
    id: `#${1042 + i}`,
    date: `2024-09-${String(placedDay).padStart(2, '0')}`,
    customer,
    shipping: {
      carrier: CARRIERS[i % CARRIERS.length]!,
      status: STATUSES[i % STATUSES.length]!,
      eta: `2024-09-${String(etaDay).padStart(2, '0')}`,
    },
    payment: {
      method: METHODS[i % METHODS.length]!,
      total: currency === 'JPY' ? usd * 150 : Math.round((usd + 0.99) * 100) / 100,
      currency,
      paid: i % 3 !== 2,
    },
  };
});

const orders: Order[] = seed();

export const listOrders = ({ q = '', page = 1, limit = 20 }: {
  q?: string;
  page?: number;
  limit?: number;
}): Paginated<Order> => {
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? orders.filter(o => o.id.toLowerCase().includes(needle) || o.customer.name.toLowerCase().includes(needle))
    : orders;

  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
};
