// GET /api/orders?q=&page=&limit= → Paginated<Order>
//
// Backs the column-groups demo (pages/orders.vue). A small latency keeps the
// table's loading state visible; unlike /api/products the race condition isn't
// the topic here, so the jitter is modest. Mirrors /api/users.
export default defineEventHandler(async (event) => {
  const { q, page, limit } = getQuery(event);

  await sleepMs(150 + Math.floor(Math.random() * 250));

  return listOrders({
    q: typeof q === 'string' ? q : '',
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
});
