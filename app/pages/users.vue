<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue';

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

const isSelf = (u: UserData) => u.id === currentUser.value?.id;
function toggleTooltip(u: UserData) {
  if (isSelf(u)) return t('users.cannotToggleSelf');
  return u.isActive ? t('users.deactivate') : t('users.activate');
}

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
          <UAlert
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="errorMessage"
            :actions="[{
              label: t('users.retry'),
              color: 'error',
              variant: 'solid',
              icon: 'i-lucide-refresh-cw',
              onClick: () => refresh(),
            }]"
          />
        </template>

        <template v-else>
          <AppDataTable
            v-model:page="page"
            v-model:page-size="pageSize"
            :data="users"
            :columns="columns"
            :total="total"
            :loading="pendingOrIdling"
            :pinned-right="['status']"
            :empty="t('users.empty')"
            class="min-h-0 flex-1"
          >
            <template #toolbar>
              <div class="flex gap-2">
                <UInput
                  v-model="filter"
                  icon="i-lucide-search"
                  :placeholder="t('users.searchPlaceholder')"
                  class="w-full sm:max-w-xs"
                />
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-refresh-cw"
                  :loading="pendingOrIdling"
                  :label="t('users.refresh')"
                  @click="refresh()"
                />
              </div>
            </template>

            <!-- Primary column: avatar + name + email subline. -->
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

            <!-- Frozen status column: the activate/deactivate toggle. -->
            <template #status-cell="{ row }">
              <div class="flex items-center justify-end">
                <UTooltip :text="toggleTooltip(row.original)">
                  <USwitch
                    :model-value="row.original.isActive"
                    :loading="isPending(row.original.id)"
                    :disabled="isSelf(row.original) || isPending(row.original.id)"
                    :aria-label="toggleTooltip(row.original)"
                    @update:model-value="(val) => setActive(row.original, val)"
                  />
                </UTooltip>
              </div>
            </template>
          </AppDataTable>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
