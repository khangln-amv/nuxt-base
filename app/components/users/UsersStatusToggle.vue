<script setup lang="ts">
// Page partial (scoped to /users): the per-row activate/deactivate switch.
// Encapsulates the "you can't toggle yourself" guard + tooltip wording, so the
// table template stays declarative. Emits the intent; the page owns the mutation.
const { user, currentUser = null, pending = false } = defineProps<{
  user: UserData;
  currentUser?: UserData | null;
  pending?: boolean;
}>();

const emit = defineEmits<{ toggle: [user: UserData, isActive: boolean] }>();
const { t } = useI18n();

const isSelf = computed(() => user.id === currentUser?.id);
const tooltip = computed(() => {
  if (isSelf.value) return t('users.cannotToggleSelf');
  return user.isActive ? t('users.deactivate') : t('users.activate');
});
</script>

<template>
  <div class="flex items-center justify-end">
    <UTooltip :text="tooltip">
      <USwitch
        :model-value="user.isActive"
        :loading="pending"
        :disabled="isSelf || pending"
        :aria-label="tooltip"
        @update:model-value="(val: boolean) => emit('toggle', user, val)"
      />
    </UTooltip>
  </div>
</template>
