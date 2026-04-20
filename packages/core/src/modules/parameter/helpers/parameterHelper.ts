import { MappedParameters, ParameterResponseItem } from '../entities/Parameter';

export interface LoadParametersOptions {
  onError?: (error: any) => void;
  valueKeys?: string[];
}

/**
 * Generic helper to load and map domain parameters
 * @param fetchFunction - Function that fetches data (e.g. getBatchParameters)
 * @param queryParam - Parameter to pass into fetchFunction
 * @param options - Optional configuration
 * @returns Mapped parameters object
 */
export const loadDomainParameters = async <T = any>(
  fetchFunction: (param: T) => Promise<ParameterResponseItem[] | any>,
  queryParam: T,
  options: LoadParametersOptions = {}
): Promise<MappedParameters> => {
  const {
    onError = null,
    valueKeys = ['values', 'data', 'parameters', 'options'],
  } = options;

  try {
    if (!queryParam || (Array.isArray(queryParam) && queryParam.length === 0)) {
      return {};
    }

    const data = await fetchFunction(queryParam);
    let mapped: MappedParameters = {};

    if (Array.isArray(data)) {
      data.forEach((item: ParameterResponseItem) => {
        let value = item;

        for (const key of valueKeys) {
          if (item[key] !== undefined) {
            value = item[key];
            break;
          }
        }

        mapped[item.fullCode] = value;
      });
    } else if (typeof data === 'object' && data !== null) {
      mapped = data as MappedParameters;
    }

    return mapped;
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error('Failed to load domain parameters', error);
    }
    return {};
  }
};
