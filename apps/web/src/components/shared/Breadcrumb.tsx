import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav className={cn("flex mb-4 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="size-3.5 mr-1.5" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="size-3.5 text-muted-foreground/50 mx-0.5 md:mx-1" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors max-w-[120px] md:max-w-[200px] truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs font-semibold text-primary/80 max-w-[120px] md:max-w-[200px] truncate">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
