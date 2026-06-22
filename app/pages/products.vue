<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';

// ─────────────────────────────────────────────────────────────────────────────
// BOILERPLATE — stable frame: page meta + the shared, debounced search input.
// The template below binds to products / pending / error / refresh and NEVER
// changes regardless of which fetching strategy is active. That decoupling is
// the whole point: the UI doesn't care how the data arrives — only correctness
// differs between the cases.
// ─────────────────────────────────────────────────────────────────────────────
definePageMeta({
  layout: 'admin',
  title: 'nav.products',
});

const { t } = useI18n();

const filter = ref('');
const debounced = useDebounce(filter, 300);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ DEMO ▼  Activate exactly ONE case. Each exposes the same                    ║
// ║   products (Product[])  ·  pending (boolean)  ·  error  ·  refresh ()       ║
// ║                                                                             ║
// ║ To see the race condition: switch to case #1, then type quickly in the      ║
// ║ search box (e.g. "mug" → clear → "pen"). The /api/products endpoint adds    ║
// ║ randomized latency, so a slower earlier request can land AFTER a faster      ║
// ║ later one and overwrite fresh results with stale data. Cases #2+ fix it.    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ── #1 · Naive vanilla fetch (THE BUG) ───────────────────────────────────────
// What a dev coming from plain Vue writes first: watch the filter, fire a fetch,
// assign the result. No AbortController, no unmount cleanup → race condition.
// const products = ref<Product[]>([]);
// const pending = ref(false);
// const error = ref<unknown>(null);
// const refresh = async () => {
//   pending.value = true;
//   try {
//     const url = new URL('/api/products', window.location.origin);
//     if (debounced.value) url.searchParams.set('q', debounced.value);
//     const res = await fetch(url);
//     products.value = await res.json();
//   } catch (e) { error.value = e; } finally { pending.value = false; }
// };
// watch(debounced, refresh, { immediate: true });

// ── #2 · Vanilla + AbortController (one correct fix; verbose & opaque) ────────
// Correct, but it's plumbing on every list page — and a teammate who hasn't seen
// the pattern won't know what the controller is for unless it's documented.
// const products = ref<Product[]>([]);
// const pending = ref(false);
// const error = ref<unknown>(null);
// let controller: AbortController | null = null;
// const refresh = async () => {
//   controller?.abort();
//   controller = new AbortController();
//   pending.value = true;
//   try {
//     const url = new URL('/api/products', window.location.origin);
//     if (debounced.value) url.searchParams.set('q', debounced.value);
//     const res = await fetch(url, { signal: controller.signal });
//     products.value = await res.json();
//   } catch (e) { if ((e as Error).name !== 'AbortError') error.value = e; }
//   finally { pending.value = false; }
// };
// watch(debounced, refresh, { immediate: true });
// onUnmounted(() => controller?.abort());

// ── #3 · useFetch (clean, race-safe by DEFAULT) ──────────────────────────────
// Auto-watches the reactive `query` and auto-unwraps the ref. `dedupe: 'cancel'`
// is the default, so a superseded request's result is discarded — the bug is
// gone with zero ceremony.
// const { data: products, status, error, refresh } = useFetch<Product[]>('/api/products', {
//   query: { q: debounced },
//   default: () => [],
//   lazy: true,
// });
// const pending = computed(() => ['pending', 'idle'].includes(status.value));

// ── #4 · useAsyncData + $fetch (equivalent to #3 — shows what useFetch sugars) ─
// Same result as #3, but YOU declare `watch: [debounced]` and read `.value`
// yourself — that's the work useFetch does for you. Race-safe (stale discarded),
// but the network request is NOT cancelled (no signal forwarded).
// const { data: products, status, error, refresh } = useAsyncData('products:search',
//   () => $fetch<Product[]>('/api/products', { query: { q: debounced.value || undefined } }),
//   { watch: [debounced], default: () => [], lazy: true },
// );
// const pending = computed(() => ['pending', 'idle'].includes(status.value));

// ── #5 · useAsyncData + { signal } (the AbortController equivalent, managed) ───
// Forwarding the handler's `signal` to $fetch makes the default dedupe:'cancel'
// actually ABORT the in-flight HTTP request, not just discard its result. Nuxt
// owns the controller lifecycle, so there's no onUnmounted plumbing (cf. #2).
// const { data: products, status, error, refresh } = useAsyncData('products:search',
//   (_nuxtApp, { signal }) => $fetch<Product[]>('/api/products', { query: { q: debounced.value || undefined }, signal }),
//   { watch: [debounced], default: () => [], lazy: true },
// );
// const pending = computed(() => ['pending', 'idle'].includes(status.value));

// ── #6 · useAsyncData + useProductApi (structure & customizability) ───────────
// The request now goes through the structured API layer — baseURL, Bearer auth,
// error normalization and types configured once in useProductApi/$apiFetch and
// reused across the app. Race-safe; no network cancellation yet.
// const { getProducts } = useProductApi();
// const { data: products, status, error, refresh } = useAsyncData('products:search',
//   () => getProducts({ q: debounced.value }),
//   { watch: [debounced], default: () => [], lazy: true },
// );
// const pending = computed(() => ['pending', 'idle'].includes(status.value));

// ── #7 · useAsyncData + useProductApi + { signal } (the production ideal) ── [ACTIVE]
// Structure AND true cancellation: getProducts forwards the signal to $apiFetch.
// This is what a real list page in this codebase should look like (cf. users.vue).
const { getProducts } = useProductApi();
const { data: products, status, error, refresh } = useAsyncData(
  'products:search',
  (_nuxtApp, { signal }) => getProducts({ q: debounced.value }, { signal }),
  { watch: [debounced], default: () => [], lazy: true, server: false },
);
// 'idle' (the brief pre-fetch window with lazy + client-only) counts as loading
// too, so the table doesn't flash empty before the first request starts.
const pending = computed(() => ['pending', 'idle'].includes(status.value));

// ╚═ DEMO ▲ END ═══════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// BOILERPLATE — columns + presentation.
// Frame is composed from the reusable <AppErrorAlert> + base <UInput>/<UTable>;
// no page partials needed (contrast with users.vue, which is complex enough to
// earn them). See docs/showcase-architecture-plan.md.
// ─────────────────────────────────────────────────────────────────────────────
const columns = computed<TableColumn<Product>[]>(() => [
  { accessorKey: 'id', header: 'ID', meta: { class: { th: 'w-16' } } },
  { accessorKey: 'name', header: t('products.columns.name') },
  {
    accessorKey: 'price',
    header: t('products.columns.price'),
    meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } },
  },
]);
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar :title="t('nav.products')" toggle>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <UInput
          v-model="filter"
          icon="i-lucide-search"
          :placeholder="t('products.searchPlaceholder')"
          class="w-full sm:max-w-xs"
        />

        <template v-if="error">
          <AppErrorAlert
            :message="t('products.error')"
            :retry-label="t('products.retry')"
            @retry="refresh"
          />
        </template>

        <template v-else-if="pending && products.length === 0">
          <div class="flex flex-col gap-3 py-2">
            <template v-for="i in 6" :key="i">
              <USkeleton class="h-8" :class="i === 6 ? 'w-2/3' : 'w-full'" />
            </template>
          </div>
        </template>

        <template v-else>
          <UTable
            :data="products"
            :columns="columns"
            :loading="pending"
            :empty="t('products.empty')"
            sticky
            class="flex-1"
          />
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
