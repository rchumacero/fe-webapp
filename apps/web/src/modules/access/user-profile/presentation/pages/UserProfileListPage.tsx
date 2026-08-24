"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@kplian/i18n';
import { UserProfile, UserProfileRepositoryImpl } from '../../infrastructure/UserProfileRepositoryImpl';
import { Profile, ProfileRepositoryImpl } from '@/modules/access/profile/infrastructure/ProfileRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Trash2, Edit2, Loader2, Save, MoreHorizontal, ArrowLeft, Calendar, Shield, BadgeAlert, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const userProfileRepository = new UserProfileRepositoryImpl();
const profileRepository = new ProfileRepositoryImpl();

export default function UserProfileListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCode = searchParams.get('userCode') || '';

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUserProfile, setEditingUserProfile] = useState<UserProfile | null>(null);

  // Form State
  const [formProfileId, setFormProfileId] = useState('');
  const [formValidFrom, setFormValidFrom] = useState('');
  const [formValidTo, setFormValidTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch system profiles to build names map
      const profilesData = await profileRepository.getAll();
      setProfiles(profilesData);
      
      const map: Record<string, string> = {};
      profilesData.forEach(p => {
        map[p.id] = p.name;
      });
      setProfilesMap(map);

      // 2. Fetch user profiles
      const userProfilesData = await userProfileRepository.getAll();
      setUserProfiles(userProfilesData);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load user profiles data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    if (!userCode) {
      toast.error('Cannot create profile mapping: no User selected.');
      return;
    }
    setEditingUserProfile(null);
    setFormProfileId(profiles[0]?.id || '');
    // Default validFrom to today's date
    const today = new Date().toISOString().split('T')[0];
    setFormValidFrom(today);
    setFormValidTo('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (up: UserProfile) => {
    setEditingUserProfile(up);
    setFormProfileId(up.profileId);
    setFormValidFrom(up.validFrom);
    setFormValidTo(up.validTo || '');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCode || !formProfileId || !formValidFrom) {
      toast.error('Profile and Start Date are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userCode,
        profileId: formProfileId,
        validFrom: formValidFrom,
        validTo: formValidTo || null,
      };

      if (editingUserProfile) {
        await userProfileRepository.update(editingUserProfile.id, {
          ...payload,
          id: editingUserProfile.id
        });
        toast.success('User profile updated successfully');
      } else {
        await userProfileRepository.create(payload);
        toast.success('User profile mapping created successfully');
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error saving user profile mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this profile mapping?')) return;
    try {
      await userProfileRepository.delete(id);
      toast.success('Profile mapping removed successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete profile mapping');
    }
  };

  // Filter user profiles by parent userCode and search text
  const filteredUserProfiles = userProfiles.filter(up => {
    // If userCode is in the query params, strictly match it
    if (userCode && up.userCode !== userCode) return false;

    // Optional query text filter
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const profileName = profilesMap[up.profileId] || '';
    return (
      up.userCode.toLowerCase().includes(term) ||
      profileName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/access/users')}
            className="rounded-full hover:bg-accent shrink-0"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="size-6 text-primary" /> User Profiles
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {userCode ? `Manage authorization profiles mapped to ${userCode}` : 'Configure system authorization mappings for identities'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={loadData} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          {userCode && (
            <Button onClick={handleOpenCreate} className="rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-white transition-all shadow-md group gap-2 px-4 h-10">
              <Plus className="size-4 group-hover:scale-110 transition-transform" />
              Assign Profile
            </Button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by profile name..."
          className="pl-9 h-11 bg-card border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredUserProfiles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-card/10 flex flex-col items-center justify-center gap-3">
          <BadgeAlert className="size-8 text-muted-foreground animate-bounce" />
          <p className="text-muted-foreground text-sm font-medium">No profile mappings registered for this identity.</p>
          {userCode && (
            <Button onClick={handleOpenCreate} variant="outline" className="mt-2 rounded-xl">
              Assign First Profile
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUserProfiles.map((up) => {
            const profileName = profilesMap[up.profileId] || 'Unknown Profile';
            return (
              <Card
                key={up.id}
                className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between rounded-3xl overflow-hidden"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full w-fit flex items-center gap-1.5">
                      <KeyRound className="size-3" />
                      {up.userCode}
                    </span>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground pt-1.5">
                      {profileName}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-card border-border/40">
                      <DropdownMenuItem onClick={() => handleOpenEdit(up)} className="cursor-pointer text-foreground text-xs gap-2">
                        <Edit2 className="size-3.5" /> Edit Dates
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(up.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 text-xs gap-2">
                        <Trash2 className="size-3.5" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 pb-6">
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 text-primary/70" />
                      <span>Valid From:</span>
                      <span className="font-bold text-foreground bg-accent/35 px-2 py-0.5 rounded-md text-[10px]">
                        {up.validFrom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 text-primary/70" />
                      <span>Valid To:</span>
                      <span className="font-bold text-foreground bg-accent/35 px-2 py-0.5 rounded-md text-[10px]">
                        {up.validTo || 'Indefinite'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              {editingUserProfile ? 'Modify Profile Mapping' : 'Assign New Profile'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Code</label>
              <Input
                value={userCode}
                disabled
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Profile</label>
              <select
                value={formProfileId}
                onChange={(e) => setFormProfileId(e.target.value)}
                className="w-full h-11 px-3 bg-card border border-border/40 text-foreground focus:ring-2 focus:ring-primary/20 rounded-xl text-sm font-medium outline-none"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid From</label>
                <Input
                  type="date"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid To</label>
                <Input
                  type="date"
                  value={formValidTo}
                  onChange={(e) => setFormValidTo(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="pt-4 flex items-center justify-between border-t border-border/5">
              <Button type="button" variant="outline" className="rounded-xl px-5" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold transition-all px-5 gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Assign Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
