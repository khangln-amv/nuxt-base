<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue';

const filter = ref<string>('');
const debouncedFilter = useDebounce(filter, 300);

const { getUsers } = useUserApi();

const { data: users, pending, refresh } = useAsyncData(
  'admin:users',
  () => getUsers(debouncedFilter.value),
  {
    default: () => [] as UserData[],
    watch: [debouncedFilter],
    lazy: true,
  },
);

const columns: TableColumn<UserData>[] = [
  { accessorKey: 'id', header: 'ID', meta: { class: { th: 'w-16' } } },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <div class="flex gap-2">
        <UInput
          v-model="filter"
          icon="i-lucide-search"
          placeholder="Search by name or email…"
          class="flex-1"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :loading="pending"
          @click="refresh()"
        >
          Refresh
        </UButton>
      </div>

      <div v-if="pending && users.length === 0" class="flex flex-col gap-3 py-2">
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
      <UTable
        v-else
        :data="users"
        :columns="columns"
        :loading="pending"
        sticky
        class="flex-1"
      />
    </div>
  </div>
</template>
