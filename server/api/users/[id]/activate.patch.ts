// PATCH /api/users/:id/activate → UserData
export default defineEventHandler((event) => {
  maybeFailMutation(); // demo chaos: randomly 503s so optimistic rollback is visible
  const id = getRouterParam(event, 'id') as string;
  const user = setUserActive(id, true);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return user;
});
