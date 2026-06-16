<script setup lang="ts">
const { uiLocale } = useUiLocale();
const { localeProperties, t, te } = useI18n();
const route = useRoute();

const lang = computed(() => localeProperties.value.language ?? uiLocale.value.code);
const dir = computed(() => uiLocale.value.dir);

const appName = computed(() => t('app.title'));

const pageTitle = computed(() => {
  const key = route.meta.title as string | undefined;
  return key && te(key) ? t(key) : '';
});

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: lang,
    dir: dir,
  },
  titleTemplate: title => title ? `${title} · ${appName.value}` : appName.value,
});

useSeoMeta({
  title: () => pageTitle.value,
  description: () => t('app.description'),
  ogTitle: () => pageTitle.value ? `${pageTitle.value} · ${appName.value}` : appName.value,
  ogDescription: () => t('app.description'),
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <UApp :locale="uiLocale" :dir="dir">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
