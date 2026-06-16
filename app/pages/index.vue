<script setup lang="ts">
const { t } = useI18n();

const features = computed(() => [
  {
    title: t('landing.features.i18n.title'),
    description: t('landing.features.i18n.description'),
    icon: 'i-lucide-languages',
  },
  {
    title: t('landing.features.ui.title'),
    description: t('landing.features.ui.description'),
    icon: 'i-lucide-palette',
  },
  {
    title: t('landing.features.api.title'),
    description: t('landing.features.api.description'),
    icon: 'i-lucide-server',
  },
]);
</script>

<template>
  <div>
    <UPageHero
      :title="t('landing.title')"
      :description="t('landing.description')"
      :links="[
        { label: t('landing.dashboardCta'), to: '/dashboard', icon: 'i-lucide-layout-dashboard', size: 'lg' },
        { label: t('landing.usersCta'), to: '/users', icon: 'i-lucide-users', color: 'neutral', variant: 'subtle', size: 'lg' },
      ]"
    />

    <UPageSection
      :title="t('landing.featuresTitle')"
      :features="features"
    />
  </div>
</template>
