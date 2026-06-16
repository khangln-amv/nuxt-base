<script setup lang="ts">
const { t } = useI18n();

const githubAriaLabel = computed(() => t('app.github'));
const footerText = computed(() => t('app.footer', { year: new Date().getFullYear() }));
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <ULink to="/">
          <AppLogo class="h-6 w-auto shrink-0" />
        </ULink>
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

        <AuthUserMenu />
      </template>
    </UHeader>

    <UMain>
      <slot />
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
  </div>
</template>
