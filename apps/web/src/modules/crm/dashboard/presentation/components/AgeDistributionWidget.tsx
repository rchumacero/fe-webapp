"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AgeDistribution } from '../../domain/entities/Dashboard';
import { DashboardRepositoryImpl } from '../../infrastructure/repositories/DashboardRepositoryImpl';
import { Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useVendor } from '@/hooks/use-vendor';

const dashboardRepository = new DashboardRepositoryImpl();

export const AgeDistributionWidget = () => {
  const [data, setData] = useState<AgeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { vendor } = useVendor();

  useEffect(() => {
    if (vendor) {
      setIsLoading(true);
      dashboardRepository.getAgeDistributionNatural().then(res => {
        setData(res);
        setIsLoading(false);
      });
    }
  }, [vendor]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

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
          Natural Persons Age Range
        </CardTitle>
        <TrendingUp className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {data.map((item, i) => {
            const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <div key={item.range} className="space-y-1.5 group/bar">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                  <span className="text-muted-foreground group-hover/bar:text-foreground transition-colors">
                    {item.label}
                  </span>
                  <span className="text-primary font-black">
                    {item.count}
                  </span>
                </div>
                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r from-primary/30 to-primary rounded-full transition-all duration-1000 ease-out group-hover/bar:brightness-110 group-hover/bar:shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]",
                      "animate-in slide-in-from-left duration-700"
                    )}
                    style={{ width: `${width}%`, transitionDelay: `${i * 100}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/5 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Age Segregation</span>
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded">
            Peak: {maxCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
