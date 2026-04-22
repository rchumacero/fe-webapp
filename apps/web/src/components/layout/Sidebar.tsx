"use client";

import React, { useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AccessMenu } from './AccessMenu';

const SIDEBAR_EXPANDED_WIDTH = 'w-[280px]';
const SIDEBAR_COLLAPSED_WIDTH = 'w-[64px]';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative h-screen flex flex-col transition-all duration-300 ease-in-out',
        'bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      )}
    >
      {/* Brand + Search Row */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0">
        {/* Logo */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-lg shadow-primary/30">
          K
        </div>

        {/* Search bar — hidden when collapsed */}
        {!isCollapsed && (
          <div className="relative flex-1 group">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search menu..."
              className={cn(
                'w-full h-9 pl-8 pr-3 rounded-lg text-[13px]',
                'bg-sidebar-accent text-sidebar-foreground placeholder:text-muted-foreground',
                'border border-sidebar-border',
                'focus:outline-none focus:ring-1 focus:ring-sidebar-primary/40',
                'transition-all',
              )}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-0 shrink-0" />

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-hidden">
        <AccessMenu isCollapsed={isCollapsed} />
      </ScrollArea>

      {/* Collapse Toggle — anchored to right edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute -right-3 top-[60px] z-50',
          'w-6 h-6 rounded-full',
          'bg-sidebar border border-sidebar-border',
          'flex items-center justify-center',
          'text-muted-foreground hover:text-sidebar-foreground',
          'shadow-md transition-all duration-200',
        )}
      >
        <ChevronLeft
          size={13}
          className={cn('transition-transform duration-300', isCollapsed && 'rotate-180')}
        />
      </button>
    </aside>
  );
};
