"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, MoreVertical, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Celebration Card */}
        <Card className="lg:col-span-2 bg-emerald-100 dark:bg-[#09261b] border-none p-10 flex flex-col justify-between relative overflow-hidden h-72">
          <div className="z-10 space-y-4">
            <h2 className="text-3xl font-bold text-emerald-900 dark:text-white transition-colors">
              Congratulations 🎉<br /> Jaydon Frankie
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300/80 max-w-md transition-colors">
              Best seller of the month you have done 57.6% more sales today.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-[#10b981] dark:hover:bg-[#059669] text-white font-bold px-8 mt-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
              Go now
            </Button>
          </div>
          {/* Abstract background shape */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </Card>

        {/* Promotion Card */}
        <Card className="bg-red-50 dark:bg-[#450a0a] border-none relative overflow-hidden group h-72">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-black/80 z-0 dark:block hidden" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">New</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">Mountain Trekking Boots</h3>
            </div>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-[#10b981] dark:hover:bg-[#059669] text-white font-bold w-full rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
              Buy now
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-200/20 dark:bg-white/5 blur-3xl rounded-full" />
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Product sold", value: "765", change: "+2.6%", up: true },
          { label: "Total balance", value: "18,765", change: "-0.1%", up: false },
          { label: "Sales profit", value: "4,876", change: "+0.6%", up: true }
        ].map((stat) => (
          <Card key={stat.label} className="bg-card dark:bg-[#161b22] border-none p-8 space-y-4 shadow-xl transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-3xl font-bold text-foreground mt-2 transition-colors">{stat.value}</h4>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-bold">
                {stat.up ? <TrendingUp size={14} className="text-emerald-600" /> : <TrendingDown size={14} className="text-red-600" />}
                <span className={stat.up ? "text-emerald-600" : "text-red-600"}>{stat.change} last week</span>
              </div>
            </div>
            {/* Minimal Line Chart Placeholder */}
            <div className="h-16 w-full pt-4 flex items-end">
               <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500/80 dark:stroke-emerald-500/50" fill="none" strokeWidth="2">
                  <path d="M0,25 Q10,5 20,20 T40,15 T60,25 T80,10 T100,20" strokeLinecap="round" />
               </svg>
            </div>
          </Card>
        ))}
      </div>

       {/* Detailed Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Pie Chart Card */}
          <Card className="bg-card dark:bg-[#161b22] border-none p-8 flex flex-col h-[450px] transition-colors">
            <h5 className="text-lg font-bold text-foreground mb-8 transition-colors">Sale by gender</h5>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-48 h-48 rounded-full border-[12px] border-emerald-500 ring-[12px] ring-orange-400 rotate-45 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <div className="absolute inset-0 flex items-center justify-center flex-col -rotate-45">
                   {/* Donut content */}
                </div>
              </div>
            </div>
          </Card>

          {/* Bar Chart Card */}
          <Card className="lg:col-span-2 bg-card dark:bg-[#161b22] border-none p-8 h-[450px] relative transition-colors">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h5 className="text-lg font-bold text-foreground transition-colors">Yearly sales</h5>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 font-bold mt-1 transition-colors">(+43%) than last year</p>
              </div>
              <Badge variant="outline" className="text-muted-foreground border-border rounded-lg py-1.5 px-4 font-bold flex items-center gap-2">
                2023 <ChevronDown size={14} />
              </Badge>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {[60, 40, 80, 50, 90, 70, 85, 45, 65, 55, 75, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-stretch group">
                  <div className="bg-orange-400/80 rounded-t-sm transition-all group-hover:bg-orange-300" style={{ height: `${h * 0.6}%` }} />
                  <div className="bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-400" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </Card>
       </div>
    </div>
  );
}
