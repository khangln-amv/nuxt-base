<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const { links, homePath } = defineProps<{
  links: NavigationMenuItem[][];
  homePath: string;
}>();

const { t } = useI18n();
const route = useRoute();

const navItems = computed(() => links.map(group => group.map((item) => {
  if (typeof item.to !== 'string') return item;
  return { ...item, active: route.path === item.to || route.path.startsWith(`${item.to}/`) };
})));
</script>

<template>
  <UDashboardSidebar
    resizable
    collapsible
    :min-size="14"
    :default-size="18"
    :max-size="24"
    :collapsed-size="5"
  >
    <!-- Logo always; app name only when expanded (placeholder until a real logo). -->
    <template #header="{ collapsed }">
      <ULink :to="homePath" class="flex items-center gap-2 overflow-hidden px-1">
        <AppLogo class="h-6 w-auto shrink-0" />
        <template v-if="!collapsed">
          <span class="truncate font-semibold text-highlighted">{{ t('app.title') }}</span>
        </template>
      </ULink>
    </template>

    <!-- Collapsed → icon rail with tooltips; expanded → icon + label. -->
    <template #default="{ collapsed }">
      <UNavigationMenu
        :items="navItems"
        :collapsed="collapsed"
        orientation="vertical"
        tooltip
      />
    </template>

    <template #footer="{ collapsed }">
      <div class="flex w-full flex-col gap-2" :class="{ 'items-center': collapsed }">
        <template v-if="collapsed">
          <UColorModeButton />
          <LanguageSwitcher compact />
          <AuthUserMenu collapsed />
        </template>
        <template v-else>
          <UColorModeSelect class="w-full" />
          <LanguageSwitcher />
          <AuthUserMenu block />
        </template>
      </div>
    </template>
  </UDashboardSidebar>
</template>
