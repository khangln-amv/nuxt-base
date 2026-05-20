import * as allUiLocales from '@nuxt/ui/locale';

export const useUiLocale = () => {
  const {
    locale: i18nLocaleCode,
    locales: i18nLocaleObjects,
  } = useI18n();

  const currentUiLocale = computed(() => allUiLocales[i18nLocaleCode.value]);
  const currentUiLocales = useArrayMap(
    i18nLocaleObjects,
    i18nLocaleObject => allUiLocales[i18nLocaleObject.code],
  );

  return {
    uiLocale: currentUiLocale,
    uiLocales: currentUiLocales,
  };
};
