export default defineNuxtPlugin((nuxtApp) => {
  // TODO: apply real auth here
  // const { session } = useUserSession();
  const session = ref({
    token: 'askdjkaskdkasdkakjsdj',
  });

  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiUrl,
    onRequest: ({ request, options, error }) => {
      if (session.value?.token) {
        options.headers.set('Authorization', `Bearer ${session.value?.token}`);
      }
    },
    onResponseError: async ({ response }) => {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo('/login'));
      }
    },
  });

  return {
    provide: {
      apiFetch,
    },
  };
});
