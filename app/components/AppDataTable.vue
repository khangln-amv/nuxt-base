<script setup lang="ts" generic="T">
import type { TableColumn } from '#ui/components/Table.vue';

defineOptions({ inheritAttrs: false });

const {
  data,
  columns,
  total,
  loading = false,
  pageSizes = [10, 20, 50],
  pinnedRight = [],
  empty,
} = defineProps<{
  data: T[];
  columns: TableColumn<T>[];
  total: number;
  loading?: boolean;
  pageSizes?: number[];
  pinnedRight?: string[];
  empty?: string;
}>();

const page = defineModel<number>('page', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 20 });

const { t } = useI18n();
const attrs = useAttrs();

const slots = defineSlots<{
  toolbar?: () => unknown;
  [name: string]: ((props: { row: { original: T } }) => unknown) | undefined;
}>();

const tableSlots = computed(() => Object.keys(slots).filter(name => name !== 'toolbar'));
const columnPinning = computed(() => ({ left: [] as string[], right: pinnedRight }));
const from = computed(() => (total === 0 ? 0 : (page.value - 1) * pageSize.value + 1));
const to = computed(() => Math.min(page.value * pageSize.value, total));
</script>

<template>
  <ClientOnly>
    <UCard
      v-bind="attrs"
      class="flex h-full flex-col"
      :ui="{ root: 'overflow-hidden', header: 'shrink-0', body: 'flex min-h-0 flex-1 flex-col p-0 sm:p-0' }"
    >
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0 flex-1">
            <slot name="toolbar" />
          </div>

          <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            <div class="flex items-center gap-1.5 text-sm text-muted">
              <span class="whitespace-nowrap">{{ t('table.rowsPerPage') }}</span>
              <USelect v-model="pageSize" :items="pageSizes" size="sm" class="w-20" />
            </div>
            <span class="whitespace-nowrap text-sm text-muted">
              {{ t('table.range', { from, to, total }) }}
            </span>
            <UPagination
              v-model:page="page"
              :total="total"
              :items-per-page="pageSize"
              :sibling-count="1"
              size="sm"
            />
          </div>
        </div>
      </template>

      <UTable
        :data="data"
        :columns="columns"
        :loading="loading"
        :column-pinning="columnPinning"
        :empty="empty"
        sticky
        class="flex-1"
        :ui="{ root: 'overflow-auto' }"
      >
        <template v-for="name in tableSlots" :key="name" #[name]="slotData">
          <slot :name="name" v-bind="slotData ?? {}" />
        </template>

        <template #empty>
          <div class="flex items-center justify-center gap-2 py-6 text-sm text-muted">
            <template v-if="loading">
              <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
              <span>{{ t('table.loading') }}</span>
            </template>
            <template v-else>
              {{ empty }}
            </template>
          </div>
        </template>
      </UTable>
    </UCard>

    <template #fallback>
      <div v-bind="attrs" class="h-full" />
    </template>
  </ClientOnly>
</template>
