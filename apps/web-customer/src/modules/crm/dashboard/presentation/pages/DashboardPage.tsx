"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { SummaryByTypeWidget } from '../components/SummaryByTypeWidget';
import { AgeDistributionWidget } from '../components/AgeDistributionWidget';
import { SeniorityDistributionWidget } from '../components/SeniorityDistributionWidget';
import { LayoutDashboard } from 'lucide-react';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const [lastSync, setLastSync] = React.useState<string>('--:--:--');

  React.useEffect(() => {
    setLastSync(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryByTypeWidget />
        <AgeDistributionWidget />
        <SeniorityDistributionWidget />
      </div>

      {/* Quick Stats / Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        <div className="p-6 rounded-2xl border border-border/40 bg-card/30 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Region</span>
          <span className="text-sm font-bold text-foreground">All Registered Areas</span>
        </div>
        <div className="p-6 rounded-2xl border border-border/40 bg-card/30 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Currency</span>
          <span className="text-sm font-bold text-foreground">Standardized (Global)</span>
        </div>
        <div className="p-6 rounded-2xl border border-border/40 bg-card/30 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Sync</span>
          <span className="text-sm font-bold text-foreground">{lastSync}</span>
        </div>
      </div>
    </div>
  );
};
