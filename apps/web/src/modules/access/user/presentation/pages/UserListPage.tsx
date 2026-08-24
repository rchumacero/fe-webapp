"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { UserRepositoryImpl } from '../../infrastructure/UserRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Search, Loader2, Users2, ShieldAlert, BadgeCheck, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const userRepository = new UserRepositoryImpl();

export default function UserListPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userRepository.getDistinctUsers(vendorFilter || undefined);
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load system user codes');
    } finally {
      setLoading(false);
    }
  }, [vendorFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(userCode => {
    if (!searchQuery) return true;
    return userCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users2 className="size-6 text-primary" /> Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View distinct user codes registered across authorization profiles
          </p>
        </div>
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
        </div>
      </div>

      {/* Filters section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user code..."
            className="pl-9 h-11 bg-card border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative max-w-xs">
          <Input
            placeholder="Filter by vendor code..."
            className="h-11 bg-card border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground rounded-xl"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          />
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-card/10 flex flex-col items-center justify-center gap-3">
          <ShieldAlert className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm font-medium">No user codes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.map((userCode) => (
            <Card
              key={userCode}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg rounded-2xl overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                    {userCode.substring(0, 2)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {userCode}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <BadgeCheck className="size-3 text-green-500" /> Active Identity
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none shrink-0">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-card border-border/40">
                    <DropdownMenuItem
                      onClick={() => router.push(`/access/user-profiles?userCode=${encodeURIComponent(userCode)}`)}
                      className="cursor-pointer text-foreground text-xs gap-2"
                    >
                      <ShieldCheck className="size-3.5" /> Profiles
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
