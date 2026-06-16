// DELETE /api/users/:id → { ok: true }
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') as string;
  if (!removeUser(id)) {
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return { ok: true };
});
