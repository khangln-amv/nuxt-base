<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue';

// Page partial (scoped to /users): the users grid. Owns the column definitions
// and the avatar/role/status cell rendering, and composes the reusable
// <AppDataTable> + the <UsersToolbar> / <UsersStatusToggle> partials.
//
// Dumb-by-design (Pattern A): all data + the mutation handler live in the page;
// this component takes props and emits intents (`refresh`, `toggle`). Pagination
// and the search term are two-way models so the page stays the single source of
// truth. `isPending` is passed as a function so its reactive Set is read here.
const {
  users,
  total,
  loading = false,
  currentUser = null,
  isPending = () => false,
} = defineProps<{
  users: UserData[];
  total: number;
  loading?: boolean;
  currentUser?: UserData | null;
  isPending?: (id: string) => boolean;
}>();

const emit = defineEmits<{
  refresh: [];
  toggle: [user: UserData, isActive: boolean];
}>();

const page = defineModel<number>('page', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 20 });
const filter = defineModel<string>('filter', { default: '' });

const { t } = useI18n();

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
  <AppDataTable
    v-model:page="page"
    v-model:page-size="pageSize"
    :data="users"
    :columns="columns"
    :total="total"
    :loading="loading"
    :pinned-right="['status']"
    :empty="t('users.empty')"
    class="min-h-0 flex-1"
  >
    <template #toolbar>
      <UsersToolbar v-model:filter="filter" :loading="loading" @refresh="emit('refresh')" />
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
      <UsersStatusToggle
        :user="row.original"
        :current-user="currentUser"
        :pending="isPending(row.original.id)"
        @toggle="(u, val) => emit('toggle', u, val)"
      />
    </template>
  </AppDataTable>
</template>
