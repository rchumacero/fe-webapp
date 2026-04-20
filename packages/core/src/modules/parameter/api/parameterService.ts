import { createApiClient, getRoute } from '@kplian/infrastructure';
import { DomainParameter, ParameterResponseItem } from '../entities/Parameter';

const PARAMETER_ROUTES = {
  BATCH_PARAMETERS: 'value/transpose/filter/batch',
} as const;

const apiClient = createApiClient('parameter');

/**
 * Fetches multiple parameters in a single batch request
 * @param parameters List of parameters to fetch
 * @returns List of parameter response items
 */
export const getBatchParameters = async (
  parameters: DomainParameter[]
): Promise<ParameterResponseItem[]> => {
  try {
    const response = await apiClient.post<ParameterResponseItem[]>(
      getRoute(PARAMETER_ROUTES.BATCH_PARAMETERS),
      parameters
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch batch parameters:', error);
    throw error;
  }
};
