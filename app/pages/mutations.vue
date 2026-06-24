<script setup lang="ts">
// useQuery / useMutation / useQueryClient / keepPreviousData are auto-imported via an
// `imports.presets` entry in nuxt.config.ts. TanStack Query isn't a Nuxt module, so
// Nuxt won't register them on its own — that preset shows how to opt a plain package
// into auto-import, so they read here unprefixed just like useFetch / useAsyncData.
import type { TableColumn } from '@nuxt/ui';

// ─────────────────────────────────────────────────────────────────────────────
// This page is a deliberate twin of users.vue — same User list, same
// activate/deactivate toggle — but the data layer is TanStack Query instead of
// useAsyncData + the hand-rolled useOptimisticToggle. The point is the contrast:
//   READ  → useQuery   (cache, dedupe, stale-while-revalidate, {signal})
//   WRITE → useMutation (optimistic update → rollback on error → invalidate)
// See docs/showcase-architecture-plan.md, Part 3.
// ─────────────────────────────────────────────────────────────────────────────
definePageMeta({
  layout: 'admin',
  title: 'nav.mutations',
});

const { t } = useI18n();
const toast = useToast();
const { toErrorMessage } = useApiError();
const { getUsers, activate, deactivate } = useUserApi();
const queryClient = useQueryClient();

// Fake "signed-in" user — mirrors users.vue so the "can't toggle yourself" guard
// has a real row to act on. (Swap for useUserSession when auth is wired.)
const currentUser = ref<UserData>({
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  isActive: true,
  role: UserRole.Admin,
});

const filter = ref('');
const debounced = useDebounce(filter, 300);

// The query key embeds the search term, so TanStack caches each term separately:
// re-typing a previous search shows its cached rows INSTANTLY, then background-
// revalidates if older than staleTime (set in app/plugins/vue-query.ts).
const usersKey = (q: string) => ['users', { q }] as const;
const queryKey = computed(() => usersKey(debounced.value));

// ── READ — useQuery ──────────────────────────────────────────────────────────
// Reactive `queryKey` → refetch on change; deduped + race-safe by default. The
// queryFn gets an AbortSignal we forward to $apiFetch, so a superseded request is
// actually cancelled (the same "production ideal" as products.vue case #7).
// `placeholderData: keepPreviousData` keeps the old rows on screen while a new
// search loads → no flash of empty state (stale-while-revalidate, visible).
// `enabled: import.meta.client` keeps it idle during SSR (client-only demo).
const { data, error, status, isFetching, refetch } = useQuery({
  queryKey,
  queryFn: ({ signal }) => getUsers({ q: debounced.value, limit: 50 }, { signal }),
  placeholderData: keepPreviousData,
  enabled: import.meta.client,
});

const users = computed(() => data.value?.data ?? []);
const errorMessage = computed(() => (error.value ? toErrorMessage(error.value) : ''));
// status === 'pending' only on the very first load (keepPreviousData keeps us in
// 'success' across key changes); use isFetching for the background-refresh hint.
const initialLoading = computed(() => status.value === 'pending');

// ── WRITE — useMutation (optimistic → rollback → invalidate) ─────────────────
// Compare with app/composables/useOptimisticToggle.ts (used in users.vue): there
// we hand-roll the pending Set, the optimistic write, the rollback and the
// reconcile — imperatively, by mutating the row object. Here each of those is a
// declarative hook on a typed context. The ONLY manual bit we keep is a small
// in-flight Set for per-row switch UI, because a mutation tracks one call at a
// time, not which rows are busy.
const pendingIds = reactive(new Set<string>());

type ToggleVars = { user: UserData; isActive: boolean };

const { mutate: toggleActive } = useMutation({
  mutationFn: ({ user, isActive }: ToggleVars) =>
    (isActive ? activate(user.id) : deactivate(user.id)),

  // optimistic: stop in-flight refetches, snapshot the cache, then patch it now so
  // the switch flips instantly. We snapshot the exact key here (the search term
  // could change before this settles) and hand it to onError/onSettled.
  onMutate: async ({ user, isActive }) => {
    pendingIds.add(user.id);
    const key = usersKey(debounced.value);
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<Paginated<UserData>>(key);
    queryClient.setQueryData<Paginated<UserData>>(key, old =>
      (old
        ? { ...old, data: old.data.map(u => (u.id === user.id ? { ...u, isActive } : u)) }
        : old),
    );
    return { key, previous };
  },

  // rollback to the snapshot captured in onMutate (the demo route 503s ~30% of
  // the time — see server/utils/chaos.ts — so this fires for real).
  onError: (err, _vars, context) => {
    if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    toast.add({ title: toErrorMessage(err), color: 'error' });
  },

  onSuccess: (_data, { isActive }) => {
    toast.add({ title: t(isActive ? 'users.activated' : 'users.deactivated'), color: 'success' });
  },

  // reconcile with server truth whatever happened — invalidate the prefix so every
  // cached search term refetches when next viewed.
  onSettled: (_data, _err, { user }) => {
    pendingIds.delete(user.id);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

// ── Presentation (reusables, not partials — like products.vue) ───────────────
const isSelf = (user: UserData) => user.id === currentUser.value.id;
const tooltip = (user: UserData) => {
  if (isSelf(user)) return t('users.cannotToggleSelf');
  return user.isActive ? t('users.deactivate') : t('users.activate');
};

const columns = computed<TableColumn<UserData>[]>(() => [
  { id: 'user', accessorKey: 'name', header: t('users.columns.user') },
  { id: 'role', accessorKey: 'role', header: t('users.columns.role'), size: 120 },
  {
    id: 'status',
    accessorKey: 'isActive',
    header: t('users.columns.status'),
    size: 120,
    meta: { class: { th: 'text-right', td: 'text-right' } },
  },
]);
</script>

<template>
  <UDashboardPanel id="mutations">
    <template #header>
      <UDashboardNavbar :title="t('nav.mutations')" toggle>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <!-- Background-refetch hint: shows while revalidating without blanking the rows. -->
          <template v-if="isFetching && !initialLoading">
            <UBadge color="neutral" variant="subtle" size="sm" class="gap-1">
              <UIcon name="i-lucide-refresh-cw" class="size-3 animate-spin" />
              {{ t('mutations.revalidating') }}
            </UBadge>
          </template>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full flex-col gap-4">
        <p class="text-sm text-muted">
          {{ t('mutations.description') }}
        </p>

        <UInput
          v-model="filter"
          icon="i-lucide-search"
          :placeholder="t('users.searchPlaceholder')"
          class="w-full sm:max-w-xs"
        />

        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-flask-conical"
          :title="t('mutations.chaosTitle')"
          :description="t('mutations.chaosHint')"
        />

        <template v-if="status === 'error'">
          <AppErrorAlert
            :message="errorMessage"
            :retry-label="t('users.retry')"
            @retry="() => refetch()"
          />
        </template>

        <template v-else-if="initialLoading && users.length === 0">
          <div class="flex flex-col gap-3 py-2">
            <template v-for="i in 6" :key="i">
              <USkeleton class="h-8" :class="i === 6 ? 'w-2/3' : 'w-full'" />
            </template>
          </div>
        </template>

        <template v-else>
          <UTable
            :data="users"
            :columns="columns"
            :loading="isFetching"
            :empty="t('users.empty')"
            sticky
            class="flex-1"
          >
            <template #user-cell="{ row }">
              <div class="flex min-w-0 items-center gap-3 py-0.5">
                <UAvatar
                  :src="row.original.avatar ?? undefined"
                  :text="row.original.name.charAt(0).toUpperCase()"
                  :alt="row.original.name"
                  size="md"
                />
                <div class="flex min-w-0 flex-col">
                  <span class="truncate font-medium text-default">{{ row.original.name }}</span>
                  <span class="truncate text-sm text-muted">{{ row.original.email }}</span>
                </div>
              </div>
            </template>

            <template #role-cell="{ row }">
              <UBadge :color="row.original.role === 'admin' ? 'primary' : 'neutral'" variant="subtle">
                {{ t(`users.roles.${row.original.role}`) }}
              </UBadge>
            </template>

            <template #status-cell="{ row }">
              <div class="flex items-center justify-end">
                <UTooltip :text="tooltip(row.original)">
                  <USwitch
                    :model-value="row.original.isActive"
                    :loading="pendingIds.has(row.original.id)"
                    :disabled="isSelf(row.original) || pendingIds.has(row.original.id)"
                    :aria-label="tooltip(row.original)"
                    @update:model-value="(val: boolean) => toggleActive({ user: row.original, isActive: val })"
                  />
                </UTooltip>
              </div>
            </template>
          </UTable>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
