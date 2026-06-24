// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  imports: {
    dirs: [
      '~/composables/**',
    ],
    // Opt a plain npm package into Nuxt's auto-import. TanStack Query isn't a Nuxt
    // module, so Nuxt doesn't register its composables for you — this `presets` entry
    // does, so useQuery/useMutation/etc. are usable unprefixed everywhere, exactly
    // like Nuxt's own useFetch/useAsyncData and our ~/composables. unimport reads the
    // preset and only injects the import in files that actually use a listed name.
    presets: [
      {
        from: '@tanstack/vue-query',
        imports: ['useQuery', 'useMutation', 'useQueryClient', 'keepPreviousData'],
      },
    ],
  },

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiUrl: '', // override by NUXT_PUBLIC_API_URL, this is just the default
    },
  },

  routeRules: {
    '/': { prerender: true }
  },

  future: {
    compatibilityVersion: 5,
  },

  experimental: {
    nitroAutoImports: true,
  },

  compatibilityDate: '2025-01-15',

  a11y: {
    enabled: false,
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'only-multiline',
        semi: true,
        braceStyle: '1tbs',
      }
    }
  },

  fonts: {
    // families: [
    //   { name: 'Custom Font', provider: 'none' },
    //   { name: 'My Font Family', provider: 'google' },
    //   { name: 'Other Font', src: 'https://example.com/font.woff2' },
    // ]
  },

  hints: {
    features: {
      hydration: false,
      lazyLoad: true,
      webVitals: true,
      thirdPartyScripts: false,
      htmlValidate: true,
    },
  },

  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
        file: 'en.json',
      },
      {
        code: 'ja',
        name: '日本語',
        language: 'ja-JP',
        file: 'ja.json',
      },
      {
        code: 'vi',
        name: 'Tiếng Việt',
        language: 'vi-VN',
        file: 'vi.json',
      },
    ],
    defaultLocale: 'en',
  },

  image: {
    // provider: 'none'
    domains: ['i.pravatar.cc'], // demo avatars (server/utils/usersStore); drop when using real images
  },
});
