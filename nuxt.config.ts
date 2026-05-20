// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@vueuse/nuxt',
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
});
