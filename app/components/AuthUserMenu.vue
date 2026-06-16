<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

type Props = {
  collapsed?: boolean;
  block?: boolean;
};
defineProps<Props>();

const { t } = useI18n();

// TODO: integrate AUTH — replace this fake session with the real one, e.g.:
// const { user, loggedIn, clear: logout } = useUserSession();
const user = ref<UserData>({
  id: '1',
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  isActive: true,
  role: UserRole.Admin,
});
const loggedIn = ref(true);
const logout = async () => {
  // TODO: call the real sign-out, then redirect to /login.
  console.log('logout');
};

const items = computed<DropdownMenuItem[][]>(() => [
  [{
    label: user.value.name || user.value.email,
    type: 'label',
    avatar: user.value.avatar ? { src: user.value.avatar } : undefined,
  }],
  [
    { label: t('nav.home'), icon: 'i-lucide-house', to: '/' },
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
  ],
  [{
    label: t('auth.signOut'),
    icon: 'i-lucide-log-out',
    onSelect: () => { logout(); },
  }],
]);
</script>

<template>
  <!--
    TODO: integrate AUTH — wrap with <AuthState> for the real loggedIn/user
    plus a loading placeholder:

    <AuthState v-slot="{ loggedIn, user }">
      ...same markup as below...
      <template #placeholder>
        <USkeleton class="h-8 w-24 rounded-md" />
      </template>
    </AuthState>
  -->
  <div>
    <template v-if="loggedIn">
      <UDropdownMenu
        :items="items"
        :content="{ align: collapsed ? 'center' : 'end' }"
      >
        <UButton
          :label="collapsed ? undefined : user.name"
          :avatar="{ src: user.avatar ?? undefined, alt: user.name }"
          :square="collapsed"
          :block="block"
          color="neutral"
          variant="ghost"
          :trailing-icon="collapsed ? undefined : 'i-lucide-chevron-down'"
        />
      </UDropdownMenu>
    </template>
    <template v-else>
      <UButton
        :label="collapsed ? undefined : t('auth.signIn')"
        to="/login"
        icon="i-lucide-log-in"
        :square="collapsed"
        :block="block"
        color="neutral"
        variant="ghost"
      />
    </template>
  </div>
</template>
