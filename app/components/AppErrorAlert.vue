<script setup lang="ts">
// Reusable, domain-agnostic error banner: a message + an optional retry action.
// Fully prop-driven (no app-specific i18n keys) so any page can drop it in and
// pass its own already-localized message + retry label. See <UsersTable> /
// pages/users.vue and pages/products.vue for usage.
defineProps<{
  message: string;
  // When provided, a retry button is rendered that emits `retry` on click.
  retryLabel?: string;
}>();

const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <UAlert
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :title="message"
    :actions="retryLabel ? [{
      label: retryLabel,
      color: 'error',
      variant: 'solid',
      icon: 'i-lucide-refresh-cw',
      onClick: () => emit('retry'),
    }] : undefined"
  />
</template>
