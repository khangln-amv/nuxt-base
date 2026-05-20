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

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

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

  image: {
    // provider: 'none'
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
});
