// In-memory user store for the demo. It lives in the Nitro runtime, so the
// activate/deactivate/update/delete mutations persist for the lifetime of the
// running server (they reset on restart — there's no database).
//
// Swap this module for a real repository (DB, ORM, upstream API) when wiring a
// backend; the route handlers in server/api/users only depend on these helpers.

const FIRST = [
  'Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Dennis', 'Katherine', 'Tim',
  'Barbara', 'Edsger', 'Donald', 'Radia', 'Ken', 'Joan', 'Guido', 'Hedy',
  'Bjarne', 'Anita', 'James', 'Sophie', 'Ravi', 'Mei', 'Omar', 'Lucia',
];
const LAST = [
  'Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Ritchie', 'Johnson',
  'Berners-Lee', 'Liskov', 'Dijkstra', 'Knuth', 'Perlman', 'Thompson', 'Clarke',
  'van Rossum', 'Lamarr', 'Stroustrup', 'Borg', 'Gosling', 'Wilson', 'Patel',
  'Chen', 'Hassan', 'Romero',
];

const emailSlug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '.');

const seed = (): UserData[] => FIRST.map((first, i) => {
  const name = `${first} ${LAST[i]}`;
  return {
    id: String(i + 1),
    name,
    email: `${emailSlug(name)}@example.com`,
    // Roughly a third get a generated avatar; the rest fall back to initials.
    avatar: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${(i % 70) + 1}` : null,
    // A handful are inactive so the activate/deactivate toggle has something to show.
    isActive: i % 5 !== 4,
    // Every 7th account (incl. the first) is an admin — see the role badge column.
    role: i % 7 === 0 ? UserRole.Admin : UserRole.User,
  };
});

// `let` so delete can reassign; everything else mutates the objects in place.
let users: UserData[] = seed();

export const listUsers = ({ q = '', page = 1, limit = 20 }: {
  q?: string;
  page?: number;
  limit?: number;
}): Paginated<UserData> => {
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? users.filter(u => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    : users;

  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
};

export const findUser = (id: string): UserData | null => users.find(u => u.id === id) ?? null;

export const updateUser = (id: string, patch: UserUpdateData): UserData | null => {
  const user = findUser(id);
  if (!user) return null;
  if (patch.name !== undefined) user.name = patch.name;
  if (patch.email !== undefined) user.email = patch.email;
  return user;
};

export const setUserActive = (id: string, isActive: boolean): UserData | null => {
  const user = findUser(id);
  if (!user) return null;
  user.isActive = isActive;
  return user;
};

export const removeUser = (id: string): boolean => {
  const before = users.length;
  users = users.filter(u => u.id !== id);
  return users.length < before;
};
