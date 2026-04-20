import { createApiClient, getRoute } from '@kplian/infrastructure';

// In a real scenario, these constants would be in a separate file
const CONTACTS_ROUTES = {
  CONTACT: '/contacts'
};

const apiClient = createApiClient('crm');

/**
 * Fetches all contacts from the CRM module
 */
export const getContacts = async () => {
  try {
    const response = await apiClient.get(getRoute(CONTACTS_ROUTES.CONTACT));
    return response.data;
  } catch (error) {
    // Error is already logged by the global interceptor in infrastructure
    throw error;
  }
};
