// PATCH /api/users/:id/deactivate → UserData
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') as string;
  const user = setUserActive(id, false);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return user;
});
