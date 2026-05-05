import { createApiClient, getRoute } from '@kplian/infrastructure';
import { MenuItem, MenuItemDto, mapMenuItemDto } from '../entities/MenuItem';

const ACCESS_ROUTES = {
  MENU_BY_USER: '/v1/access/menu/by-user/:userCode',
} as const;

const apiClient = createApiClient('access');

export const getMenuByUser = async (userCode: string, forceRefresh = false): Promise<MenuItem[]> => {
  try {
    const url = getRoute(ACCESS_ROUTES.MENU_BY_USER, { userCode });
    const finalUrl = forceRefresh ? `${url}?_t=${Date.now()}` : url;
    const response = await apiClient.get<MenuItemDto[]>(finalUrl);
    return response.data.map(mapMenuItemDto);
  } catch (error) {
    console.error(`Failed to fetch menu for user: ${userCode}`, error);
    return [];
  }
};
