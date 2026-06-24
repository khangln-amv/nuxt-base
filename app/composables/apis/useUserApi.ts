export const useUserApi = () => {
  const { $apiFetch } = useNuxtApp();

  const getUsers = async (
    params?: { q?: string; page?: number; limit?: number },
    // Optional abort signal — forwarded to $apiFetch so callers (e.g. the
    // useQuery on pages/mutations.vue) can cancel a superseded request. Optional
    // and last so existing one-arg callers (users.vue) are unaffected.
    opts?: { signal?: AbortSignal },
  ) => $apiFetch<Paginated<UserData>>('/api/users', {
    query: {
      q: params?.q || undefined,
      page: params?.page,
      limit: params?.limit,
    },
    signal: opts?.signal,
  });
  const getUser = async (id: string) => $apiFetch<UserData>(`/api/users/${id}`);

  const updateUser = async (id: string, payload: UserUpdateData) => $apiFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: payload,
  });

  const deleteUser = async (id: string) => $apiFetch(`/api/users/${id}`, {
    method: 'DELETE',
  });

  const activate = async (id: string) => $apiFetch<UserData>(`/api/users/${id}/activate`, {
    method: 'PATCH',
  });
  const deactivate = async (id: string) => $apiFetch<UserData>(`/api/users/${id}/deactivate`, {
    method: 'PATCH',
  });

  return {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    activate,
    deactivate,
  };
};
