export function useApiError() {
  const { t, te } = useI18n();

  const toErrorMessage = (input: unknown): string => {
    const code = typeof input === 'string' ? input : getApiErrorCode(input);
    const key = `errors.${code}`;
    return te(key) ? t(key) : t(`errors.${ApiErrorCode.Unknown}`);
  };

  return { toErrorMessage };
}
