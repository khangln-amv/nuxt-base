// Single source of truth for API error codes. The backend returns one in the
// error body's `data.code` (see the server/api/users handlers) and the client
// maps it to a localized message (i18n `errors.<code>`, via getApiErrorCode /
// the commented useApiError example). Declared as `const … as const` rather
// than a TS enum so it stays tree-shakeable with zero runtime overhead and no
// isolatedModules / edge-runtime footguns.
export const ApiErrorCode = {
  Validation: 'validation',
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  Conflict: 'conflict',
  BadRequest: 'bad_request',
  ServerError: 'server_error',
  Upstream: 'upstream',
  Db: 'db',
  Unknown: 'unknown',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
