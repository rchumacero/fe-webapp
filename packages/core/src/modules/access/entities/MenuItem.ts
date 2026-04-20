/** Raw shape returned by the backend API */
export interface MenuItemDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly type: 'menu' | 'view' | string;
  readonly endpoint?: string;
  readonly icon?: string;
  readonly restricted?: boolean;
  readonly children?: MenuItemDto[];
}

/** Internal domain model used by the UI */
export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly url?: string;
  readonly groupLabel?: string;
  readonly children?: MenuItem[];
}

/** Maps a DTO tree to the domain MenuItem model */
export const mapMenuItemDto = (dto: MenuItemDto): MenuItem => ({
  id: dto.id,
  label: dto.name,
  icon: dto.icon,
  url: dto.endpoint || undefined,
  children: dto.children?.map(mapMenuItemDto),
});
