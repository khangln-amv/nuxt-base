// PATCH /api/users/:id { name?, email? } → UserData
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string;
  const body = await readBody<UserUpdateData>(event);
  const user = updateUser(id, body ?? {});
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return user;
});
