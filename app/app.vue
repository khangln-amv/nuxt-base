<script setup lang="ts">
const { uiLocale } = useUiLocale();
const { localeProperties, t } = useI18n();

const lang = computed(() => localeProperties.value.language ?? uiLocale.value.code);
const dir = computed(() => uiLocale.value.dir);

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
  }
});

const title = t('app.title');
const description = t('app.description');
const githubAriaLabel = computed(() => t('app.github'));
const footerText = computed(() => t('app.footer', { year: new Date().getFullYear() }));

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
});
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <ULink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </ULink>

        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />

        <LanguageSwitcher />

        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          :aria-label="githubAriaLabel"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          {{ footerText }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          :aria-label="githubAriaLabel"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
