// Domain API layer for the Order resource — the structured "reusable composable"
// that data-fetching strategies call into (see useProductApi for the same shape).
// baseURL, auth header, error handling and types are configured once in the
// $apiFetch plugin (plugins/backendApiClient.ts).
//
// `getOrders` forwards an optional AbortSignal to $apiFetch (ofetch) so the
// caller's useAsyncData can make the request truly cancellable.
export const useOrderApi = () => {
  const { $apiFetch } = useNuxtApp();

  const getOrders = (
    params?: { q?: string; page?: number; limit?: number },
    opts?: { signal?: AbortSignal },
  ) =>
    $apiFetch<Paginated<Order>>('/api/orders', {
      query: { q: params?.q || undefined, page: params?.page, limit: params?.limit },
      signal: opts?.signal,
    });

  return { getOrders };
};
