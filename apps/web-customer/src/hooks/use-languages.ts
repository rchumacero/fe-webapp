import { useTranslation, getLanguageLabel, getLanguageFlag, SUPPORTED_LANGS } from '@kplian/i18n';
import { useDomainParameters } from '@/hooks/use-domain-parameters';

export const useLanguages = () => {
  const { i18n } = useTranslation();
  
  const { data, isLoading } = useDomainParameters({
    parameters: [{ fullCode: 'GEN/LAN' }]
  });
  
  const langsFromParam = data['GEN/LAN'];
  
  if (langsFromParam && Array.isArray(langsFromParam) && langsFromParam.length > 0) {
    return {
      languages: langsFromParam.map(p => {
        const code = p.CODE || p.code;
        return {
          code,
          label: p.NAME || p.name || p.label || getLanguageLabel(code),
          flag: p.ICON || p.icon || getLanguageFlag(code),
        };
      }).filter(lang => lang.code && lang.code !== 'cimode'),
      isLoading
    };
  }

  // Use explicitly exported languages as fallback
  const supportedLngs = (i18n.options.supportedLngs as string[]) || SUPPORTED_LANGS;
  
  return {
    languages: supportedLngs
      .filter(code => code !== 'cimode')
      .map(code => ({
        code,
        label: getLanguageLabel(code),
        flag: getLanguageFlag(code),
      })),
    isLoading: false
  };
};
