// GET /api/users?q=&page=&limit= → Paginated<UserData>
export default defineEventHandler(async (event) => {
  const { q, page, limit } = getQuery(event);

  // Simulate a little network latency so the table's loading state is visible.
  await sleepMs(300);

  return listUsers({
    q: typeof q === 'string' ? q : '',
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
});
