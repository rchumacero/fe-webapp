import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation, getLanguageLabel, getLanguageFlag, SUPPORTED_LANGS } from '@kplian/i18n';
import { loadDomainParameters, getBatchParameters } from '@kplian/core';

export const useLanguages = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchParameters = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const mapped = await loadDomainParameters(
        getBatchParameters,
        [{ fullCode: 'GEN/LAN' }]
      );
      if (mapped['GEN/LAN']) {
        setData(mapped['GEN/LAN']);
      }
    } catch (err) {
      console.error("Failed to load GEN/LAN", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);
  
  if (data && data.length > 0) {
    return {
      languages: data.map(p => {
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
