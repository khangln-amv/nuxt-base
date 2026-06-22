<script setup lang="ts">
definePageMeta({
  // middleware: ['auth', 'admin'], //TODO: integrate middleware when needed
  layout: 'admin',
  title: 'nav.users',
});

const { t } = useI18n();
const toast = useToast();

// Maps the backend's error code (error body `data.code`) to a localized message;
// see useApiError / getApiErrorCode / the errors.* locale keys.
const { toErrorMessage } = useApiError();

const { getUsers, activate, deactivate } = useUserApi();

// TODO: apply when integrate AUTH
// const { user: currentUser } = useUserSession();
// Fake "signed-in" user — matches the first seeded account (server/utils/usersStore),
// so the "you can't toggle yourself" rule has a real row to act on.
const currentUser = ref<UserData>({
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  isActive: true,
  role: UserRole.Admin,
});

// ── Page owns the data + UI state (Pattern A: smart page / dumb partials) ──
// Filter + pagination live here so the toolbar, table and fetch stay in sync;
// the <UsersTable> partial just renders props and emits intents.
const filter = ref('');
const debouncedFilter = useDebounce(filter, 300);
const page = ref(1);
const pageSize = ref(20);

// Reset to the first page whenever the search term or page size changes.
watch([debouncedFilter, pageSize], () => {
  page.value = 1;
});

const { data, status, error, refresh } = useAsyncData(
  'admin:users',
  () => getUsers({ q: debouncedFilter.value, page: page.value, limit: pageSize.value }),
  {
    default: () => ({ data: [], total: 0, page: 1, limit: pageSize.value }) as Paginated<UserData>,
    watch: [debouncedFilter, page, pageSize],
    // Client-only fetch (see incidents/sources) — authed table data needs no SSR
    // and this avoids the lazy hydration mismatch.
    lazy: true,
    server: false,
  },
);

const errorMessage = computed(() => error.value ? toErrorMessage(error.value) : '');
const users = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);
const pendingOrIdling = computed(() => ['pending', 'idle'].includes(status.value));

const { toggle: setActive, isPending } = useOptimisticToggle<UserData, 'isActive'>(
  'isActive',
  async (u, isActive) => {
    const updated = isActive ? await activate(u.id) : await deactivate(u.id);
    toast.add({ title: t(isActive ? 'users.activated' : 'users.deactivated'), color: 'success' });
    return updated;
  },
  e => toast.add({ title: toErrorMessage(e), color: 'error' }),
);
</script>

<template>
  <UDashboardPanel id="admin-users">
    <template #header>
      <UDashboardNavbar :title="t('nav.users')" toggle>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full flex-col">
        <template v-if="status === 'error'">
          <AppErrorAlert
            :message="errorMessage"
            :retry-label="t('users.retry')"
            @retry="refresh"
          />
        </template>
        <template v-else>
          <UsersTable
            v-model:page="page"
            v-model:page-size="pageSize"
            v-model:filter="filter"
            :users="users"
            :total="total"
            :loading="pendingOrIdling"
            :current-user="currentUser"
            :is-pending="isPending"
            @refresh="refresh"
            @toggle="setActive"
          />
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
