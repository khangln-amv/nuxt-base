// GET /api/users/:id → UserData
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') as string;
  const user = findUser(id);
  if (!user) {
    // `data.code` is the stable error code the client maps to a localized
    // message — see getApiErrorCode() / the commented useApiError() example.
    throw createError({ statusCode: 404, statusMessage: 'User not found', data: { code: ApiErrorCode.NotFound } });
  }
  return user;
});
