<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const { t } = useI18n();

// `NavigationMenuItem[][]` — each inner array is a visually separated group.
// Add a second group (optionally with a `{ type: 'label' }` heading) to extend
// the sidebar, e.g. [{ label: 'Settings', icon: '…', to: '/settings' }].
const links = computed<NavigationMenuItem[][]>(() => [
  [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: t('nav.users'), icon: 'i-lucide-users', to: '/users' },
  ],
]);
</script>

<template>
  <UDashboardGroup storage-key="admin">
    <AppDashboardSidebar :links="links" home-path="/dashboard" />

    <slot />
  </UDashboardGroup>
</template>
