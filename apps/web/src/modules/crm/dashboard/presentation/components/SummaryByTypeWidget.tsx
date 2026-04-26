"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SummaryByType } from '../../domain/entities/Dashboard';
import { DashboardRepositoryImpl } from '../../infrastructure/repositories/DashboardRepositoryImpl';
import { Loader2, Users } from 'lucide-react';
import { useVendor } from '@/hooks/use-vendor';

const dashboardRepository = new DashboardRepositoryImpl();

export const SummaryByTypeWidget = () => {
  const [data, setData] = useState<SummaryByType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { vendor } = useVendor();

  useEffect(() => {
    if (vendor) {
      setIsLoading(true);
      dashboardRepository.getSummaryByType().then(res => {
        setData(res);
        setIsLoading(false);
      });
    }
  }, [vendor]);

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (isLoading) {
    return (
      <Card className="h-[350px] flex flex-col items-center justify-center border-border/40 bg-card/50 backdrop-blur-sm">
        <Loader2 className="animate-spin text-primary size-8" />
      </Card>
    );
  }

  return (
    <Card className="h-[350px] border-border/40 bg-card hover:border-primary/30 transition-all duration-300 shadow-lg group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
          Distribution by Type
        </CardTitle>
        <Users className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Simple Animated Donut Chart using SVG */}
          <div className="relative size-40">
            <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
              {data.map((item, i) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                let offset = 0;
                if (total > 0) {
                  for (let j = 0; j < i; j++) {
                    offset += (data[j].count / total) * 100;
                  }
                }
                
                return (
                  <circle
                    key={item.type}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color || (i === 0 ? '#10b981' : '#3b82f6')}
                    strokeWidth="12"
                    strokeDasharray={`${percentage} ${100 - percentage}`}
                    strokeDashoffset={-offset}
                    className="transition-all duration-1000 ease-out hover:strokeWidth-[14px] cursor-pointer"
                    style={{ strokeLinecap: 'round' }}
                  >
                    <title>{`${item.label}: ${item.count}`}</title>
                  </circle>
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-foreground">{total}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
            </div>
          </div>

          <div className="mt-8 w-full space-y-3">
            {data.map((item, i) => (
              <div key={item.type} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-2">
                  <div 
                    className="size-3 rounded-full shadow-sm shadow-primary/20" 
                    style={{ backgroundColor: item.color || (i === 0 ? '#10b981' : '#3b82f6') }} 
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black">{item.count}</span>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase">
                    {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
