<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui';

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN GROUPS demo (FilamentPHP-style grouped headers) + a FROZEN action column.
//
// The whole lesson lives in the `columns` array below:
//   • A *group column* is a def with `header` + nested `columns: []` and NO
//     `accessorKey`. NuxtUI/TanStack render the extra header row automatically —
//     Table.vue loops `getHeaderGroups()` and emits the colspan per level, so
//     there is ZERO custom header markup.
//   • Leaf columns use *dotted* accessorKeys (`customer.name`) matching the nested
//     Order shape, and an explicit `id` so the `#<id>-cell` slots are predictable.
//   • This TanStack build (8.21.x) never emits rowSpan — every header's rowSpan is
//     0 — so a *standalone* top-level column would render an empty cell in the
//     group row rather than spanning both rows. We therefore group every DATA
//     column (Order / Customer / Shipping / Payment); only the pinned Actions
//     column is standalone, where a blank cell above the ⋮ menu is expected.
//   • The Actions column is FROZEN via <AppDataTable>'s `pinned-right` prop: it
//     stays put (position: sticky) while the wide grouped table scrolls sideways.
//     The two header rows freeze together because `sticky` targets <thead>.
// ─────────────────────────────────────────────────────────────────────────────
definePageMeta({
  layout: 'admin',
  title: 'nav.orders',
});

const { t, locale } = useI18n();
const toast = useToast();
const { copy } = useClipboard();
const { getOrders } = useOrderApi();

// Smart page owns data + pagination + search state (same shape as users.vue).
const filter = ref('');
const debounced = useDebounce(filter, 300);
const page = ref(1);
const pageSize = ref(20);

// Reset to the first page whenever the search term or page size changes.
watch([debounced, pageSize], () => {
  page.value = 1;
});

const { data, status, refresh } = useAsyncData(
  'orders:search',
  (_nuxtApp, { signal }) => getOrders(
    { q: debounced.value, page: page.value, limit: pageSize.value },
    { signal },
  ),
  {
    default: () => ({ data: [], total: 0, page: 1, limit: pageSize.value }) as Paginated<Order>,
    watch: [debounced, page, pageSize],
    // Client-only, like users.vue — authed table data needs no SSR.
    lazy: true,
    server: false,
  },
);

const orders = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);
const pendingOrIdling = computed(() => ['pending', 'idle'].includes(status.value));

// ── Presentation helpers (localized) ─────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(new Date(iso));

const fmtMoney = (p: Order['payment']) =>
  new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: p.currency,
    maximumFractionDigits: p.currency === 'JPY' ? 0 : 2,
  }).format(p.total);

const statusColor = (s: Order['shipping']['status']) =>
  (({ pending: 'neutral', shipped: 'info', delivered: 'success', cancelled: 'error' }) as const)[s];

// Frozen action column: a per-row dropdown of (non-mutating) demo actions.
const rowActions = (order: Order): DropdownMenuItem[] => [
  {
    label: t('orders.actions.view'),
    icon: 'i-lucide-eye',
    onSelect: () => toast.add({ title: t('orders.actions.viewToast', { id: order.id }), color: 'info' }),
  },
  {
    label: t('orders.actions.copy'),
    icon: 'i-lucide-copy',
    onSelect: () => {
      copy(order.id);
      toast.add({ title: t('orders.actions.copied', { id: order.id }), color: 'success' });
    },
  },
  {
    label: t('orders.actions.track'),
    icon: 'i-lucide-truck',
    onSelect: () => toast.add({ title: t('orders.actions.tracking', { id: order.id }), color: 'info' }),
  },
];

// ── The grouped columns (the whole point of this page) ───────────────────────
// `groupTh` centres the parent header + draws the divider before each group;
// `boundary` continues that divider down the group's first leaf column.
const groupTh = 'text-center border-s border-default';
const boundary = { th: 'border-s border-default', td: 'border-s border-default' };

const columns = computed<TableColumn<Order>[]>(() => [
  //  This is for non-grouped base design

  {
    id: 'orderId',
    accessorKey: 'id',
    header: t('orders.cols.orderId'),
    meta: { class: { td: 'font-medium text-highlighted' } },
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: t('orders.cols.placed'),
    cell: ({ row }) => fmtDate(row.original.date),
  },
  //  This is for grouped base design

  // {
  //   id: 'order',
  //   header: t('orders.groups.order'),
  //   meta: { class: { th: 'text-center' } },
  //   columns: [
  //     {
  //       id: 'orderId',
  //       accessorKey: 'id',
  //       header: t('orders.cols.orderId'),
  //       meta: { class: { td: 'font-medium text-highlighted' } },
  //     },
  //     {
  //       id: 'date',
  //       accessorKey: 'date',
  //       header: t('orders.cols.placed'),
  //       cell: ({ row }) => fmtDate(row.original.date),
  //     },
  //   ],
  // },
  {
    id: 'customer',
    header: t('orders.groups.customer'),
    meta: { class: { th: groupTh } },
    columns: [
      { id: 'custName', accessorKey: 'customer.name', header: t('orders.cols.name'), meta: { class: boundary } },
      { id: 'custCountry', accessorKey: 'customer.country', header: t('orders.cols.country') },
    ],
  },
  {
    id: 'shipping',
    header: t('orders.groups.shipping'),
    meta: { class: { th: groupTh } },
    columns: [
      { id: 'shipCarrier', accessorKey: 'shipping.carrier', header: t('orders.cols.carrier'), meta: { class: boundary } },
      { id: 'shipStatus', accessorKey: 'shipping.status', header: t('orders.cols.status') },
      {
        id: 'shipEta',
        accessorKey: 'shipping.eta',
        header: t('orders.cols.eta'),
        cell: ({ row }) => fmtDate(row.original.shipping.eta),
      },
    ],
  },
  {
    id: 'payment',
    header: t('orders.groups.payment'),
    meta: { class: { th: groupTh } },
    columns: [
      { id: 'payMethod', accessorKey: 'payment.method', header: t('orders.cols.method'), meta: { class: boundary } },
      {
        id: 'payTotal',
        accessorKey: 'payment.total',
        header: t('orders.cols.total'),
        meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } },
        cell: ({ row }) => fmtMoney(row.original.payment),
      },
      {
        id: 'payPaid',
        accessorKey: 'payment.paid',
        header: t('orders.cols.paid'),
        meta: { class: { th: 'text-center', td: 'text-center' } },
      },
    ],
  },
  // Standalone + pinned right → the frozen action column.
  { id: 'actions', header: '', meta: { class: { th: 'w-12 border-s border-default', td: 'w-12 border-s border-default' } } },
]);
</script>

<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar :title="t('nav.orders')" toggle>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full flex-col gap-4">
        <p class="text-sm text-muted">
          {{ t('orders.description') }}
        </p>

        <template v-if="status === 'error'">
          <AppErrorAlert
            :message="t('orders.error')"
            :retry-label="t('orders.retry')"
            @retry="refresh"
          />
        </template>

        <template v-else>
          <AppDataTable
            v-model:page="page"
            v-model:page-size="pageSize"
            :data="orders"
            :columns="columns"
            :total="total"
            :loading="pendingOrIdling"
            :pinned-right="['actions']"
            :empty="t('orders.empty')"
            class="min-h-0 flex-1"
          >
            <template #toolbar>
              <UInput
                v-model="filter"
                icon="i-lucide-search"
                :placeholder="t('orders.searchPlaceholder')"
                class="w-full sm:max-w-xs"
              />
            </template>

            <!-- Shipping status → coloured badge. -->
            <template #shipStatus-cell="{ row }">
              <UBadge :color="statusColor(row.original.shipping.status)" variant="subtle">
                {{ t(`orders.status.${row.original.shipping.status}`) }}
              </UBadge>
            </template>

            <!-- Paid → icon indicator. -->
            <template #payPaid-cell="{ row }">
              <UIcon
                :name="row.original.payment.paid ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'"
                :class="row.original.payment.paid ? 'text-success' : 'text-muted'"
                class="size-5 align-middle"
              />
            </template>

            <!-- Frozen action column: per-row dropdown menu. -->
            <template #actions-cell="{ row }">
              <div class="flex justify-center">
                <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :aria-label="t('orders.actions.label')"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </AppDataTable>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
