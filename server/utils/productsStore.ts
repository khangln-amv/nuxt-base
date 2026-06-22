// In-memory product store for the data-fetching demo (pages/products.vue).
// Read-only — the demo only searches/lists; mirror usersStore if mutations are
// ever needed. Resets on server restart (no database).

const NAMES = [
  'Aurora Desk Lamp', 'Borealis Mug', 'Cedar Notebook', 'Drift Headphones',
  'Ember Kettle', 'Fjord Backpack', 'Glacier Water Bottle', 'Harbor Tote',
  'Iris Keyboard', 'Juniper Candle', 'Kelp Yoga Mat', 'Lumen Desk Pad',
  'Maple Cutting Board', 'Nimbus Pillow', 'Onyx Pen Set', 'Pebble Mouse',
  'Quartz Coaster', 'Ridge Wallet', 'Slate Planter', 'Tide Umbrella',
  'Umber Stool', 'Verde Watering Can', 'Willow Basket', 'Zephyr Fan',
];

const seed = (): Product[] => NAMES.map((name, i) => ({
  id: String(i + 1),
  name,
  // Deterministic pseudo-prices so the table has varied, stable values.
  price: Math.round((9 + ((i * 37) % 90) + 0.99) * 100) / 100,
}));

const products: Product[] = seed();

export const listProducts = ({ q = '' }: { q?: string }): Product[] => {
  const needle = q.trim().toLowerCase();
  if (!needle) return products;
  return products.filter(p => p.name.toLowerCase().includes(needle));
};
