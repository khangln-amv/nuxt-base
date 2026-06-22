// Domain API layer for the Product resource — the "reusable composable" that
// data-fetching strategies call into (useAsyncData/useFetch/useQuery), rather
// than being wrapped by them. baseURL, auth header, error handling and types are
// configured once in the $apiFetch plugin (plugins/backendApiClient.ts).
//
// `getProducts` accepts an optional AbortSignal and forwards it to $apiFetch
// (ofetch) so callers can make the request truly cancellable — see cases #5/#7
// in pages/products.vue.
export const useProductApi = () => {
  const { $apiFetch } = useNuxtApp();

  const getProducts = (params?: { q?: string }, opts?: { signal?: AbortSignal }) =>
    $apiFetch<Product[]>('/api/products', {
      query: { q: params?.q || undefined },
      signal: opts?.signal,
    });

  return { getProducts };
};
