import { createApiClient, getRoute } from '@kplian/infrastructure';
import { MenuItem, MenuItemDto, mapMenuItemDto } from '../entities/MenuItem';

export const MENU_CODES = {
  WEB_APP: 'WEB_APP',
  MOBILE_APP: 'MOBILE_APP',
} as const;

const ACCESS_ROUTES = {
  MENU_BY_USER: '/v1/access/menu/by-user/:userCode/:menuCode',
} as const;

const apiClient = createApiClient('access');

export const getMenuByUser = async (
  userCode: string,
  menuCode: string = MENU_CODES.WEB_APP,
  forceRefresh = false
): Promise<MenuItem[]> => {
  try {
    const url = getRoute(ACCESS_ROUTES.MENU_BY_USER, { userCode, menuCode });
    const finalUrl = forceRefresh ? `${url}?_t=${Date.now()}` : url;
    const response = await apiClient.get<MenuItemDto[]>(finalUrl);
    return response.data.map(mapMenuItemDto);
  } catch (error) {
    console.error(`Failed to fetch menu for user: ${userCode} and menu: ${menuCode}`, error);
    return [];
  }
};
