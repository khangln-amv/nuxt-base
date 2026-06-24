import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

// TanStack Query wiring for the mutations showcase (pages/mutations.vue).
//
// Done by hand on purpose: a wrapper module (e.g. @hebilicious/vue-query-nuxt,
// @peterbud/nuxt-query) would auto-install this and hide it — but the whole point
// of the demo is to SHOW the plumbing. One QueryClient is created per request on
// the server (plugins run per-request) and once on the client, so there's no
// cross-request cache leak.
//
// CLIENT-ONLY DEMO. We deliberately skip SSR dehydrate/hydrate to keep this small,
// matching users.vue / products.vue (authed table data needs no SSR and it avoids
// a hydration round-trip). The plugin still runs universally so the QueryClient is
// injected during SSR — the page's useQuery stays idle on the server via
// `enabled: import.meta.client`, then fetches on the client.
//
// ⚠️ FOOTGUN IF YOU LEAN ON TANSTACK PROJECT-WIDE — read before adding an SSR page.
// Unlike useFetch/useAsyncData, useQuery is NOT SSR-transparent. Nuxt's "write plain
// Vue, flip one config line for SSR" promise does NOT extend to TanStack queries:
// with no wiring, a useQuery on an SSR'd route runs CLIENT-ONLY and fails SILENTLY —
// no error, the server just ships empty HTML and data appears post-hydration. Fine
// for an authed dashboard (this demo); a real SEO/LCP regression on a public page
// (e-com product / search) where you assumed SSR was happening. Server-rendering a
// query takes TWO explicit layers, neither free:
//   1) HERE, once: dehydrate(queryClient) on the `app:rendered` hook + hydrate() on
//      `app:created`, shuttled through a useState payload — without it the client
//      refetches even when the server fetched (transport ≠ payload transfer); and
//   2) per query you want on the server: onServerPrefetch(() => query.suspense())
//      — hide it in a `useSsrQuery` wrapper so call sites stay clean.
// (suspense() throws on a failed fetch during SSR — wrap in try/catch or it 500s
// instead of letting the client retry; relevant given server/utils/chaos.ts.)
// See docs/showcase-architecture-plan.md, Part 3 → "Adoption caveat".
export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // A fetched query stays "fresh" for 30s: revisiting a cached search term
        // (or navigating back to the page) shows its rows INSTANTLY, then quietly
        // background-refetches once stale. This is the stale-while-revalidate story.
        staleTime: 1000 * 30,
        retry: 1,
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});
