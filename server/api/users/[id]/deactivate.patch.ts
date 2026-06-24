// PATCH /api/users/:id/deactivate → UserData
export default defineEventHandler((event) => {
  maybeFailMutation(); // demo chaos: randomly 503s so optimistic rollback is visible
  const id = getRouterParam(event, 'id') as string;
  const user = setUserActive(id, false);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return user;
});
