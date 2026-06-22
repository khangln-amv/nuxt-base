<script setup lang="ts">
// Page partial (scoped to /users): the table's search box + refresh button.
// Knows the users page's i18n keys — that's what makes it a partial, not a
// reusable component. `filter` is a two-way model; refresh is emitted up.
defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ refresh: [] }>();

const filter = defineModel<string>('filter', { default: '' });
const { t } = useI18n();
</script>

<template>
  <div class="flex gap-2">
    <UInput
      v-model="filter"
      icon="i-lucide-search"
      :placeholder="t('users.searchPlaceholder')"
      class="w-full sm:max-w-xs"
    />
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-refresh-cw"
      :loading="loading"
      :label="t('users.refresh')"
      @click="emit('refresh')"
    />
  </div>
</template>
