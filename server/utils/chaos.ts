// Demo-only chaos. The optimistic-UI rollback path (pages/mutations.vue's
// useMutation.onError, and useOptimisticToggle on users.vue) is dead code unless
// mutations can actually fail — the in-memory store never errors on its own. So
// we make the activate/deactivate routes reject a fraction of the time, on the
// server, so rollback is observable live.
//
// Shared by both toggle routes, so BOTH the Users page (hand-rolled rollback) and
// the Mutations page (TanStack rollback) demonstrate recovery. Set the rate to 0
// to disable (e.g. to keep the Users page pristine while demoing it).
//
// `createError` (Nitro/h3) and `ApiErrorCode` (shared/utils) are auto-imported.
export const MUTATION_FAIL_RATE = 0.3;

export const maybeFailMutation = () => {
  if (Math.random() < MUTATION_FAIL_RATE) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Simulated failure (demo chaos)',
      data: { code: ApiErrorCode.ServerError },
    });
  }
};
