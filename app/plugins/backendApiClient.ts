export default defineNuxtPlugin({
  name: 'backendApiClient',
  dependsOn: [], // if this plugin need to run AFTER other plugins
  setup: (nuxtApp) => {
    const config = useRuntimeConfig();

    const apiFetch = $fetch.create({
      baseURL: config.public.apiUrl, // if not provide, use the same URI as frontend, only needed when use external backend
      onRequest: ({ request, options, error }) => {
        // TODO: example: intercept request, error,...
        console.log(request);
        console.log(error);

        // TODO: apply real auth here
        // const { session } = useUserSession();
        const session = ref({
          token: 'askdjkaskdkasdkakjsdj',
        });

        if (session.value?.token) {
          options.headers.set('Authorization', `Bearer ${session.value?.token}`);
        }
      },
      onResponseError: ({ response }) => {
        if (import.meta.client && response.status === 401) {
          nuxtApp.runWithContext(async () => {
            // TODO: example: clear user session and force re-login when token/ cookie expires

            // const { loggedIn, clear } = useUserSession();
            // if (!loggedIn.value) return;
            // await clear();

            // if (useRoute().path !== '/login') await navigateTo('/login');
          });
        }
      },
    });

    return {
      provide: {
        apiFetch,
      },
    };
  },
});
