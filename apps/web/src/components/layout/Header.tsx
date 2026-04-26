"use client";

import React from 'react';
import {
  Bell,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { useTheme } from "next-themes";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useLanguages } from '@/hooks/use-languages';
import { useTranslation } from '@kplian/i18n';
import { getFriendlyTimeZones } from '@kplian/core';
import { Clock, Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useVendor } from '@/hooks/use-vendor';
import { Building2 } from 'lucide-react';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { i18n } = useTranslation();
  const languages = useLanguages();

  const [timezone, setTimezone] = React.useState('UTC');
  const [timezoneSearch, setTimezoneSearch] = React.useState('');
  const allTimezones = getFriendlyTimeZones();

  React.useEffect(() => {
    const savedTz = localStorage.getItem('app-timezone');
    if (savedTz) {
      setTimezone(savedTz);
    } else {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem('app-timezone', tz);
    // Reload to apply globally if needed, or use a store
    window.dispatchEvent(new Event('timezone-changed'));
  };

  const filteredTimezones = allTimezones.filter(tz =>
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.name.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLogout = async () => {
    // Federated Logout: Clear Next-Auth session and redirect to Zitadel end_session
    const issuer = process.env.NEXT_PUBLIC_ZITADEL_ISSUER;
    const postLogoutUrl = window.location.origin;
    const idToken = (session as any)?.idToken;

    // Zitadel end_session endpoint: /oidc/v1/end_session
    let logoutUrl = `${issuer}/oidc/v1/end_session?post_logout_redirect_uri=${encodeURIComponent(postLogoutUrl)}`;
    if (idToken) {
      logoutUrl += `&id_token_hint=${idToken}`;
    }

    // 1. Clear local Next-Auth session without auto-redirecting
    sessionStorage.removeItem('vendor_selected');
    await signOut({ redirect: false });

    // 2. Perform manual redirect to Zitadel to clear their global session cookie
    window.location.href = logoutUrl;
  };

  const userDisplay = (session?.user?.name && session.user.name !== 'User')
    ? session.user.name
    : (session?.user as any)?.username || session?.user?.email || 'User';

  const userInitial = userDisplay
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "U";

  const { t } = useTranslation();
  const { vendorName } = useVendor();

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-8 gap-4">
      {/* Left side: Active Vendor Indicator */}
      <div className="flex items-center">
        {vendorName && (
          <button 
            onClick={() => window.dispatchEvent(new Event('open-vendor-selector'))}
            className="group flex items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-sm hover:bg-primary/10 active:scale-95 transition-all duration-200 outline-none animate-in fade-in slide-in-from-left-4"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
              <Building2 size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 leading-none mb-1 group-hover:text-primary transition-colors">Acting as</span>
              <span className="text-xs font-bold text-foreground leading-none">{vendorName}</span>
            </div>
          </button>
        )}
      </div>

      {/* Center/Global side: Home Button */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <button className="p-2.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-xl transition-all group shadow-sm border border-transparent hover:border-border/40 active:scale-95">
            <Home size={20} className="group-hover:text-primary transition-colors" />
          </button>
        </Link>
      </div>

      {/* Right side global actions */}
      <div className="flex items-center gap-4">
        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded-lg transition-all group outline-none">
            <span className="text-xl">{currentLanguage?.flag || '🌐'}</span>
            <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 mt-2 bg-popover border-border text-popover-foreground shadow-2xl p-1">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer py-2 rounded-md transition-colors",
                  i18n.language === lang.code ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Timezone */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded-lg transition-all group outline-none">
            <Clock size={20} className="text-muted-foreground group-hover:text-foreground" />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground hidden sm:block">
              {allTimezones.find(tz => tz.name === timezone)?.offset || 'UTC'}
            </span>
            <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2 bg-popover border-border text-popover-foreground shadow-2xl p-0 overflow-hidden">
            <div
              className="p-2 bg-accent/30 flex items-center gap-2 border-b border-border"
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Search size={14} className="text-muted-foreground" />
              <Input
                placeholder="Search timezone..."
                className="h-8 border-none bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground text-xs"
                value={timezoneSearch}
                onChange={(e) => setTimezoneSearch(e.target.value)}
                autoFocus
                onSelect={(e) => e.stopPropagation()}
              />
            </div>
            <ScrollArea className="h-72">
              <div className="p-1">
                {filteredTimezones.map((tz) => (
                  <DropdownMenuItem
                    key={tz.name}
                    onClick={() => handleTimezoneChange(tz.name)}
                    className={cn(
                      "flex flex-col items-start gap-1 cursor-pointer py-2 px-3 rounded-md transition-colors",
                      timezone === tz.name ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    )}
                  >
                    <span className="text-xs font-semibold">{tz.label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase opacity-70">{tz.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button className="relative p-2.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-xl transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-4 h-4 bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center rounded-full font-bold border-2 border-background ring-1 ring-destructive/20">
            2
          </span>
        </button>

        {/* Settings */}
        <button className="p-2.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-xl transition-all group">
          <Settings size={20} />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 p-1 group">
              <Avatar className="h-9 w-9 border-2 border-border ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userDisplay}`} />
                <AvatarFallback className="bg-muted text-foreground font-bold text-xs">{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start mr-2">
                <span className="text-sm font-semibold leading-none">{userDisplay}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email || ''}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2 bg-popover border-border text-popover-foreground shadow-2xl p-2 px-3">
            <div className="flex items-center justify-between py-3 px-2">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={16} className="text-muted-foreground" /> : <Sun size={16} className="text-amber-500" />}
                <span className="text-sm font-medium">{t('common.darkMode')}</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem className="focus:bg-accent cursor-pointer py-3 rounded-lg">
              {t('common.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="focus:bg-destructive/10 cursor-pointer py-3 rounded-lg text-destructive"
            >
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
