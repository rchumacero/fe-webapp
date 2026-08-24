import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  loadDomainParameters, 
  getBatchParameters, 
  DomainParameter, 
  MappedParameters 
} from '@kplian/core';
import { useTranslation } from '@kplian/i18n';

interface UseDomainParametersProps {
  parameters: DomainParameter[];
  valueKeys?: string[];
}

export const useDomainParameters = ({ 
  parameters, 
  valueKeys = [] 
}: UseDomainParametersProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<MappedParameters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const isFetchingRef = useRef(false);

  const paramsKey = JSON.stringify(parameters);
  const keysKey = JSON.stringify(valueKeys);

  const fetchParameters = useCallback(async () => {
    if (!parameters || parameters.length === 0 || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const mapped = await loadDomainParameters(
        getBatchParameters,
        parameters,
        {
          onError: (err) => {
            console.error(t("common.parameterLoadError") || "Failed to load domain parameters", err);
            setError(err);
          },
          valueKeys: valueKeys.length > 0 ? valueKeys : undefined
        }
      );
      setData(mapped);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [paramsKey, keysKey, t]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchParameters 
  };
};
