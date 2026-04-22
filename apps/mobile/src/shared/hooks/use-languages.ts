import { useTranslation, getLanguageLabel, getLanguageFlag, SUPPORTED_LANGS } from '@kplian/i18n';

export const useLanguages = () => {
  const { i18n } = useTranslation();
  
  const supportedLngs = (i18n.options.supportedLngs as string[]) || SUPPORTED_LANGS;
  
  return supportedLngs
    .filter(code => code !== 'cimode')
    .map(code => ({
      code,
      label: getLanguageLabel(code),
      flag: getLanguageFlag(code),
    }));
};
