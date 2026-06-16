<script setup lang="ts">
definePageMeta({
  // middleware: ['auth'], // TODO: integrate middleware when needed
  layout: 'admin',
  title: 'nav.dashboard',
});

const { t } = useI18n();

// TODO: apply when integrate AUTH
// const { user } = useUserSession();
const user = ref<UserData>({
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  isActive: true,
  role: UserRole.Admin,
});

// Static demo figures — wire these to real aggregates when a backend exists.
const stats = computed(() => [
  { label: t('dashboard.stats.users'), value: '24', icon: 'i-lucide-users' },
  { label: t('dashboard.stats.active'), value: '20', icon: 'i-lucide-user-check' },
  { label: t('dashboard.stats.admins'), value: '4', icon: 'i-lucide-shield' },
]);
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="t('nav.dashboard')" toggle>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <div>
          <h1 class="text-xl font-semibold text-highlighted">
            {{ t('dashboard.welcome', { name: user.name }) }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.placeholder') }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UPageCard
            v-for="stat in stats"
            :key="stat.label"
            :icon="stat.icon"
            :title="stat.value"
            :description="stat.label"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
