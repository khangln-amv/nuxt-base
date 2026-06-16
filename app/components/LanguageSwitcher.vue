<script setup lang="ts">
const { locale, setLocale } = useI18n();
const { uiLocales } = useUiLocale();

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    setLocale(value);
  },
});
</script>

<template>
  <ULocaleSelect
    v-model="currentLocale"
    :locales="uiLocales"
  />
</template>
