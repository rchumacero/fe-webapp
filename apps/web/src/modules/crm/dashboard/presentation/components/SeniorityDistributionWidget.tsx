"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SeniorityDistribution } from '../../domain/entities/Dashboard';
import { DashboardRepositoryImpl } from '../../infrastructure/repositories/DashboardRepositoryImpl';
import { Loader2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useVendor } from '@/hooks/use-vendor';

const dashboardRepository = new DashboardRepositoryImpl();

export const SeniorityDistributionWidget = () => {
  const [data, setData] = useState<SeniorityDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { vendor } = useVendor();

  useEffect(() => {
    if (vendor) {
      setIsLoading(true);
      dashboardRepository.getSeniorityDistributionLegal().then(res => {
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
          Legal Entities Seniority
        </CardTitle>
        <Briefcase className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {data.map((item, i) => {
            const width = (item.count / maxCount) * 100;
            return (
              <div key={item.range} className="space-y-1 group/row">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                  <span className="text-muted-foreground group-hover/row:text-foreground transition-colors">{item.label}</span>
                  <span className="text-primary">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-1000 ease-out group-hover/row:brightness-110",
                      "animate-in slide-in-from-left duration-700"
                    )}
                    style={{ width: `${width}%`, transitionDelay: `${i * 100}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Tip:</span>
            <span>Seniority is calculated from the constitution date.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
