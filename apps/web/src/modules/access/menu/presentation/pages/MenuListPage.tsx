"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@kplian/i18n';
import { Menu, MenuRepositoryImpl, App, AppRepositoryImpl } from '@kplian/infrastructure';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Trash2, Edit2, Loader2, Save, MoreHorizontal, LayoutGrid, Terminal, Info, ChevronLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const menuRepository = new MenuRepositoryImpl();
const appRepository = new AppRepositoryImpl();

export default function MenuListPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;

  const [parentApp, setParentApp] = useState<App | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchParentApp = useCallback(async () => {
    if (!appId) return;
    try {
      const data = await appRepository.getById(appId);
      setParentApp(data);
    } catch (err) {
      console.error('Failed to load parent application details', err);
    }
  }, [appId]);

  const fetchMenus = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const data = await menuRepository.getByAppId(appId);
      setMenus(data);
    } catch (err) {
      toast.error('Failed to load application menus');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchParentApp();
    fetchMenus();
  }, [fetchParentApp, fetchMenus]);

  const handleOpenCreate = () => {
    setEditingMenu(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormCode(menu.code);
    setFormName(menu.name);
    setFormDescription(menu.description || '');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) {
      toast.error('Code and Name are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingMenu) {
        await menuRepository.update(editingMenu.id, {
          appId,
          code: formCode,
          name: formName,
          description: formDescription,
        });
        toast.success('Menu updated successfully');
      } else {
        await menuRepository.create({
          appId,
          code: formCode,
          name: formName,
          description: formDescription,
        });
        toast.success('Menu created successfully');
      }
      setDialogOpen(false);
      fetchMenus();
    } catch (err: any) {
      toast.error(err.message || 'Error saving menu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu grouping?')) return;
    try {
      await menuRepository.delete(id);
      toast.success('Menu deleted successfully');
      fetchMenus();
    } catch (err) {
      toast.error('Failed to delete menu');
    }
  };

  const filteredMenus = menus.filter(menu => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      (menu.name || '').toLowerCase().includes(term) ||
      (menu.code || '').toLowerCase().includes(term) ||
      (menu.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header navigation section */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <button onClick={() => router.push('/access/app')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-all mb-1 bg-accent/20 px-2.5 py-1 rounded-full w-fit border border-border/5">
            <ChevronLeft className="size-3.5" /> Back to Apps
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutGrid className="size-6 text-primary" /> Application Menus
          </h1>
          {parentApp && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Managing menus for: <span className="font-bold text-primary">{parentApp.name} ({parentApp.code})</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button variant="ghost" size="icon" onClick={fetchMenus} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button onClick={handleOpenCreate} className="rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-white transition-all shadow-md group gap-2 px-4 h-10">
            <Plus className="size-4 group-hover:scale-110 transition-transform" />
            New Menu
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menus by code, name or description..."
          className="pl-9 h-11 bg-card border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-card/10">
          <p className="text-muted-foreground text-sm">No menus registered for this application.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <Card
              key={menu.id}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between rounded-3xl overflow-hidden"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full w-fit flex items-center gap-1.5">
                    <Terminal className="size-3" />
                    {menu.code}
                  </span>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground pt-1.5">
                    {menu.name}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-card border-border/40">
                    <DropdownMenuItem onClick={() => router.push(`/access/menu/${menu.id}/resource`)} className="cursor-pointer text-foreground text-xs gap-2">
                      <LayoutGrid className="size-3.5" /> View Resources
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(menu)} className="cursor-pointer text-foreground text-xs gap-2">
                      <Edit2 className="size-3.5" /> Edit Menu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(menu.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 text-xs gap-2">
                      <Trash2 className="size-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 pb-6 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-3 min-h-[48px]">
                  {menu.description || 'No description available for this menu grouping.'}
                </p>
                {menu.status && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={menu.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[9px] px-2 py-0.5 rounded-full uppercase">
                      {menu.status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Info className="size-5 text-primary" />
              {editingMenu ? 'Modify Menu' : 'Add New Menu Grouping'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menu Code</label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="MENU_CODE"
                disabled={!!editingMenu}
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menu Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Menu Name"
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Menu description..."
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4 flex items-center justify-between border-t border-border/5">
              <Button type="button" variant="outline" className="rounded-xl px-5" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold transition-all px-5 gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Menu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
