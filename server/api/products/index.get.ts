// GET /api/products?q= → Product[]
//
// Randomized latency (200–900ms) is deliberate: it makes the data-fetching race
// condition observable. A slower earlier request can resolve AFTER a faster
// later one, so a naive fetch-in-a-watch overwrites fresh results with stale
// ones. See pages/products.vue (case #1) and docs/showcase-architecture-plan.md.
export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);

  await sleepMs(200 + Math.floor(Math.random() * 700));

  return listProducts({ q: typeof q === 'string' ? q : '' });
});
