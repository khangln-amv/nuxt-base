export function useOptimisticToggle<T extends { id: string }, K extends keyof T>(
  key: K,
  update: (row: T, value: T[K]) => Promise<T>,
  onError?: (error: unknown) => void,
) {
  const pending = reactive(new Set<string>());

  async function toggle(row: T, value: T[K]) {
    if (pending.has(row.id)) return; // ignore repeat clicks while a request is in flight
    pending.add(row.id);
    const previous = row[key];
    row[key] = value; // optimistic
    try {
      const updated = await update(row, value);
      row[key] = updated[key]; // reconcile with the server's truth
    } catch (error) {
      row[key] = previous; // rollback
      onError?.(error);
    } finally {
      pending.delete(row.id);
    }
  }

  return {
    toggle,
    isPending: (id: string) => pending.has(id),
  };
}
