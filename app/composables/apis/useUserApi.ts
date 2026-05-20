export const useUserApi = () => {
  const { $apiFetch } = useNuxtApp();

  const getUsers = async (filter?: string) => $apiFetch<UserData[]>('/api/users', {
    query: {
      q: filter || undefined,
    }
  });
  const getUser = async (id: string) => $apiFetch<UserData>(`/api/users/${id}`);
  const updateUser = async (id: string, payload: UserUpdateData) => $apiFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  const deleteUser = async (id: string) => $apiFetch(`/api/users/${id}`, {
    method: 'DELETE',
  });

  return {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
  };
};
