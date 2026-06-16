<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

type Props = { compact?: boolean };
const { compact } = defineProps<Props>();

const { locale, setLocale, t } = useI18n();
const { uiLocales } = useUiLocale();

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    setLocale(value);
  },
});

const localeItems = computed<DropdownMenuItem[]>(() =>
  uiLocales.value.map((l): DropdownMenuItem => ({
    label: l.name,
    color: l.code === locale.value ? 'primary' : undefined,
    onSelect: () => {
      setLocale(l.code as typeof locale.value);
    },
  })),
);
</script>

<template>
  <template v-if="compact">
    <UDropdownMenu
      :items="localeItems"
      :content="{ align: 'end' }"
      :ui="{ content: 'min-w-fit' }"
    >
      <UButton
        icon="i-lucide-languages"
        color="neutral"
        variant="ghost"
        :aria-label="t('nav.language')"
      />
    </UDropdownMenu>
  </template>
  <template v-else>
    <ULocaleSelect
      v-model="currentLocale"
      :locales="uiLocales"
    />
  </template>
</template>
