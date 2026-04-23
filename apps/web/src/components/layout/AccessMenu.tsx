"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { getMenuByUser, MenuItem } from '@kplian/core';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccessMenuProps {
  readonly isCollapsed: boolean;
}

const ICON_SIZE = 18;

const renderIcon = (iconName?: string) => {
  if (!iconName) return <Icons.Layout size={ICON_SIZE} />;
  // @ts-ignore
  const IconComponent = Icons[iconName] ?? Icons.Layout;
  return <IconComponent size={ICON_SIZE} />;
};

const SectionLabel = ({
  label,
  isCollapsed,
}: {
  label: string;
  isCollapsed: boolean;
}) => (
  <div
    className={cn(
      'px-4 pt-5 pb-2',
      isCollapsed && 'opacity-0 pointer-events-none h-0 overflow-hidden py-0',
    )}
  >
    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-sidebar-foreground/40 select-none">
      {label}
    </span>
  </div>
);

interface MenuItemRowProps {
  readonly item: MenuItem;
  readonly level: number;
  readonly isCollapsed: boolean;
  readonly isActive: boolean;
  readonly isExpanded: boolean;
  readonly onToggle: (id: string, e: React.MouseEvent) => void;
  /** True when this item lives under a "USER MENU" group */
  readonly isUserMenu?: boolean;
}

const MenuItemRow = ({
  item,
  level,
  isCollapsed,
  isActive,
  isExpanded,
  onToggle,
  isUserMenu = false,
}: MenuItemRowProps) => {
  const hasChildren = (item.children?.length ?? 0) > 0;

  const inner = (
    <div
      className={cn(
        'w-full flex items-center gap-3 h-10 px-4 cursor-pointer select-none',
        'transition-colors duration-150',
        isActive
          ? 'text-sidebar-foreground bg-white/5'
          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5',
        isCollapsed && 'justify-center px-0',
      )}
      style={{ paddingLeft: !isCollapsed ? `${16 + level * 20}px` : undefined }}
      onClick={hasChildren ? (e) => onToggle(item.id, e) : undefined}
    >
      {/* Icon — circle outline style for user-menu, filled icon for main menu */}
      <span className="shrink-0 flex items-center justify-center">
        {isUserMenu && !isCollapsed ? (
          <span
            className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
              isActive ? 'border-sidebar-primary' : 'border-muted-foreground/50',
            )}
          />
        ) : (
          renderIcon(item.icon)
        )}
      </span>

      {/* Label */}
      {!isCollapsed && (
        <>
          <span className="flex-1 text-[13.5px] leading-none truncate">{item.label}</span>
          {hasChildren && (
            <Icons.ChevronDown
              size={14}
              className={cn(
                'shrink-0 text-muted-foreground/60 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          )}
        </>
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          {item.url && !hasChildren ? (
            <Link href={item.url}>{inner}</Link>
          ) : (
            inner
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="text-[12px]">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (item.url && !hasChildren) {
    return <Link href={item.url}>{inner}</Link>;
  }

  return inner;
};

// ─── Group renderer ───────────────────────────────────────────────────────────

interface MenuGroupProps {
  readonly items: MenuItem[];
  readonly isCollapsed: boolean;
  readonly label?: string;
  readonly isUserMenu?: boolean;
  readonly pathname: string | null;
  readonly expandedItems: Record<string, boolean>;
  readonly onToggle: (id: string, e: React.MouseEvent) => void;
}

const MenuGroup = ({
  items,
  isCollapsed,
  label,
  isUserMenu = false,
  pathname,
  expandedItems,
  onToggle,
}: MenuGroupProps) => {
  const renderTree = (item: MenuItem, level = 0): React.ReactNode => {
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = !!expandedItems[item.id];
    const isActive =
      pathname === item.url ||
      (!!item.url && item.url !== '/' && !!pathname?.startsWith(item.url));

    return (
      <div key={item.id}>
        <MenuItemRow
          item={item}
          level={level}
          isCollapsed={isCollapsed}
          isActive={isActive}
          isExpanded={isExpanded}
          onToggle={onToggle}
          isUserMenu={isUserMenu && level === 0}
        />
        {hasChildren && isExpanded && !isCollapsed && (
          <div>{item.children?.map((child) => renderTree(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      {label && <SectionLabel label={label} isCollapsed={isCollapsed} />}
      {items.map((item) => renderTree(item))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const AccessMenu = ({ isCollapsed }: AccessMenuProps) => {
  const { data: session } = useSession();
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const userCode = (session?.user as any)?.username || (session?.user as any)?.id;

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userCode) return;
      const data = await getMenuByUser(userCode);
      setMenuData(data);
    };

    if (userCode) {
      fetchMenu();
    }
  }, [userCode]);

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (menuData.length === 0) {
    return (
      <div className="px-4 py-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 bg-sidebar-accent/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  // Split into top-level items and named groups based on groupLabel field
  // Render ungrouped items first, then section-grouped items
  const ungrouped = menuData.filter((item) => !item.groupLabel);
  const grouped = menuData.filter((item) => !!item.groupLabel);

  // Collect unique group labels preserving order
  const groupLabels = [...new Set(grouped.map((item) => item.groupLabel as string))];

  return (
    <div className="py-2">
      {/* Top-level items without a group */}
      {ungrouped.length > 0 && (
        <MenuGroup
          items={ungrouped}
          isCollapsed={isCollapsed}
          pathname={pathname}
          expandedItems={expandedItems}
          onToggle={handleToggle}
        />
      )}

      {/* Grouped sections */}
      {groupLabels.map((label) => {
        const items = grouped.filter((item) => item.groupLabel === label);
        const isUserMenu = label.toLowerCase().includes('user');
        return (
          <MenuGroup
            key={label}
            label={label}
            items={items}
            isCollapsed={isCollapsed}
            isUserMenu={isUserMenu}
            pathname={pathname}
            expandedItems={expandedItems}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
};
