"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@kplian/i18n';
import { Resource, ResourceRepositoryImpl, Menu, MenuRepositoryImpl } from '@kplian/infrastructure';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Trash2, Edit2, Loader2, Save, MoreHorizontal, LayoutGrid, Terminal, Info, ChevronLeft, ChevronRight, ChevronDown, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const resourceRepository = new ResourceRepositoryImpl();
const menuRepository = new MenuRepositoryImpl();

interface ResourceNodeProps {
  resource: Resource;
  depth: number;
  onEdit: (res: Resource) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  childrenMap: Record<string, Resource[]>;
  loadingMap: Record<string, boolean>;
  loadChildren: (parentId: string) => Promise<void>;
  hasNoChildrenMap: Record<string, boolean>;
}

function ResourceNode({ 
  resource, 
  depth, 
  onEdit, 
  onDelete, 
  onCreateChild,
  childrenMap,
  loadingMap,
  loadChildren,
  hasNoChildrenMap
}: ResourceNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const children = childrenMap[resource.id] || [];
  const isLoading = loadingMap[resource.id] || false;
  const hasNoChildren = hasNoChildrenMap[resource.id] || false;

  const handleToggleExpand = async () => {
    const nextState = !expanded;
    setExpanded(nextState);
    if (nextState && !childrenMap[resource.id] && !isLoading) {
      await loadChildren(resource.id);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between p-3.5 bg-card/65 border border-border/40 hover:border-primary/20 hover:bg-accent/5 rounded-2xl transition-all shadow-sm"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
          {!hasNoChildren ? (
            <button 
              onClick={handleToggleExpand} 
              className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-accent/40 text-muted-foreground transition-all shrink-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-3 animate-spin text-primary" />
              ) : expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-2 overflow-hidden flex-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full w-fit flex items-center gap-1 shrink-0">
              <Terminal className="size-3" />
              {resource.code}
            </span>
            <span className="font-semibold text-sm truncate text-foreground">
              {resource.name}
            </span>
            {resource.endpoint && (
              <span className="text-xs text-muted-foreground bg-accent/20 border border-border/10 px-2 py-0.5 rounded-md truncate max-w-xs font-mono">
                {resource.endpoint}
              </span>
            )}
            <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground w-fit shrink-0">
              {resource.type}
            </Badge>
            {resource.restricted ? (
              <Badge className="bg-destructive/10 text-destructive border-none text-[9px] flex items-center gap-1 w-fit shrink-0 py-0.5">
                <ShieldAlert className="size-3" /> Restricted
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] flex items-center gap-1 w-fit shrink-0 py-0.5">
                <ShieldCheck className="size-3" /> Public
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
            <DropdownMenuItem onClick={() => onCreateChild(resource.id)} className="cursor-pointer text-foreground text-xs gap-2">
              <Plus className="size-3.5" /> Add Child
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(resource)} className="cursor-pointer text-foreground text-xs gap-2">
              <Edit2 className="size-3.5" /> Edit Resource
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(resource.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 text-xs gap-2">
              <Trash2 className="size-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && children.length > 0 && (
        <div className="space-y-2 border-l border-border/20 pl-2">
          {children.map(child => (
            <ResourceNode
              key={child.id}
              resource={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              childrenMap={childrenMap}
              loadingMap={loadingMap}
              loadChildren={loadChildren}
              hasNoChildrenMap={hasNoChildrenMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourceListPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const menuId = params.menuId as string;

  const [parentMenu, setParentMenu] = useState<Menu | null>(null);
  const [resources, setResources] = useState<Resource[]>([]); // Roots
  const [allFlatResources, setAllFlatResources] = useState<Resource[]>([]); // For Parent selector & Search
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Lazy loading state
  const [childrenMap, setChildrenMap] = useState<Record<string, Resource[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [hasNoChildrenMap, setHasNoChildrenMap] = useState<Record<string, boolean>>({});

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('view');
  const [formRestricted, setFormRestricted] = useState(false);
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formModuleCode, setFormModuleCode] = useState('ACCESS');
  const [submitting, setSubmitting] = useState(false);

  const fetchParentMenu = useCallback(async () => {
    if (!menuId) return;
    try {
      const data = await menuRepository.getById(menuId);
      setParentMenu(data);
    } catch (err) {
      console.error('Failed to load parent menu details', err);
    }
  }, [menuId]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourceRepository.getAll();
      const menuResources = data.filter(res => res.menuId === menuId);
      setAllFlatResources(menuResources);
      
      const menuRoots = menuResources.filter(res => !res.resourceId);
      setResources(menuRoots);

      // Clear child maps when refetching
      setChildrenMap({});
      setLoadingMap({});
      setHasNoChildrenMap({});
    } catch (err) {
      toast.error('Failed to load application resources');
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  const loadChildren = useCallback(async (parentId: string) => {
    setLoadingMap(prev => ({ ...prev, [parentId]: true }));
    try {
      const data = await resourceRepository.getChildren(parentId);
      // Filter out non-matching menu items if needed
      const menuChildren = data.filter(c => c.menuId === menuId);
      setChildrenMap(prev => ({ ...prev, [parentId]: menuChildren }));
      if (menuChildren.length === 0) {
        setHasNoChildrenMap(prev => ({ ...prev, [parentId]: true }));
      }
    } catch (err) {
      toast.error('Failed to load children');
    } finally {
      setLoadingMap(prev => ({ ...prev, [parentId]: false }));
    }
  }, [menuId]);

  useEffect(() => {
    fetchParentMenu();
    fetchResources();
  }, [fetchParentMenu, fetchResources]);

  const handleOpenCreateRoot = () => {
    setEditingResource(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormType('view');
    setFormRestricted(false);
    setFormEndpoint('');
    setFormParentId('');
    setFormModuleCode('ACCESS');
    setDialogOpen(true);
  };

  const handleOpenCreateChild = (parentId: string) => {
    setEditingResource(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormType('action');
    setFormRestricted(true);
    setFormEndpoint('');
    setFormParentId(parentId);
    setFormModuleCode('ACCESS');
    setDialogOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setFormCode(res.code);
    setFormName(res.name);
    setFormDescription(res.description || '');
    setFormType(res.type);
    setFormRestricted(res.restricted);
    setFormEndpoint(res.endpoint || '');
    setFormParentId(res.resourceId || '');
    setFormModuleCode(res.moduleCode);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formType || !formModuleCode) {
      toast.error('Code, Name, Type, and Module Code are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formCode,
        name: formName,
        description: formDescription || undefined,
        type: formType,
        restricted: formRestricted,
        endpoint: formEndpoint || undefined,
        resourceId: formParentId || undefined,
        moduleCode: formModuleCode,
        menuId,
      };

      if (editingResource) {
        await resourceRepository.update(editingResource.id, payload);
        toast.success('Resource updated successfully');
      } else {
        await resourceRepository.create(payload);
        toast.success('Resource created successfully');
      }
      setDialogOpen(false);
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || 'Error saving resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const hasChildren = allFlatResources.some(r => r.resourceId === id);
    const msg = hasChildren 
      ? 'Warning: This resource has children. Deleting it may cause orphan children in the tree. Are you sure you want to delete?'
      : 'Are you sure you want to delete this resource?';
    if (!confirm(msg)) return;
    try {
      await resourceRepository.delete(id);
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  // Simple query filtering on the flat tree
  const filteredResources = allFlatResources.filter(res => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      (res.name || '').toLowerCase().includes(term) ||
      (res.code || '').toLowerCase().includes(term) ||
      (res.endpoint || '').toLowerCase().includes(term) ||
      (res.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          {parentMenu && (
            <button 
              onClick={() => router.push(`/access/app/${parentMenu.appId}/menu`)} 
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-all mb-1 bg-accent/20 px-2.5 py-1 rounded-full w-fit border border-border/5"
            >
              <ChevronLeft className="size-3.5" /> Back to Menus
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutGrid className="size-6 text-primary" /> Menu Resources
          </h1>
          {parentMenu && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Managing hierarchical resources for menu: <span className="font-bold text-primary">{parentMenu.name} ({parentMenu.code})</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button variant="ghost" size="icon" onClick={fetchResources} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button onClick={handleOpenCreateRoot} className="rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-white transition-all shadow-md group gap-2 px-4 h-10">
            <Plus className="size-4 group-hover:scale-110 transition-transform" />
            New Root Resource
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter resources by name, code or path..."
          className="pl-9 h-11 bg-card border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : allFlatResources.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-card/10">
          <p className="text-muted-foreground text-sm">No resources registered for this menu.</p>
        </div>
      ) : searchQuery ? (
        // Flat matching list when searching
        <div className="space-y-3">
          {filteredResources.map(res => (
            <ResourceNode
              key={res.id}
              resource={res}
              depth={0}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onCreateChild={handleOpenCreateChild}
              childrenMap={childrenMap}
              loadingMap={loadingMap}
              loadChildren={loadChildren}
              hasNoChildrenMap={hasNoChildrenMap}
            />
          ))}
        </div>
      ) : (
        // Hierarchical tree when not searching (Roots only, children loaded on demand)
        <div className="space-y-4">
          {resources.map(root => (
            <ResourceNode
              key={root.id}
              resource={root}
              depth={0}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onCreateChild={handleOpenCreateChild}
              childrenMap={childrenMap}
              loadingMap={loadingMap}
              loadChildren={loadChildren}
              hasNoChildrenMap={hasNoChildrenMap}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Info className="size-5 text-primary" />
              {editingResource ? 'Modify Resource' : 'Register New Resource'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource Code</label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="RESOURCE_CODE"
                disabled={!!editingResource}
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Resource Name"
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Resource description..."
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource Type</label>
              <select 
                value={formType} 
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-card/50 border border-border/40 focus:ring-primary/20 rounded-xl h-10 px-3 text-foreground outline-none"
              >
                <option value="view" className="bg-card">View</option>
                <option value="action" className="bg-card">Action</option>
                <option value="menu" className="bg-card">Menu</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Endpoint / URL Path</label>
              <Input
                value={formEndpoint}
                onChange={(e) => setFormEndpoint(e.target.value)}
                placeholder="/crm/custom-path"
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Module Code</label>
              <Input
                value={formModuleCode}
                onChange={(e) => setFormModuleCode(e.target.value)}
                placeholder="CRM"
                className="bg-card/50 border-border/40 focus:ring-primary/20 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-accent/25 rounded-2xl border border-border/30">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Restricted</span>
                <span className="text-[10px] text-muted-foreground">Requires permissions to access</span>
              </div>
              <input 
                type="checkbox" 
                checked={formRestricted} 
                onChange={(e) => setFormRestricted(e.target.checked)}
                className="size-5 rounded border-border/40 accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parent Resource</label>
              <select 
                value={formParentId} 
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full bg-card/50 border border-border/40 focus:ring-primary/20 rounded-xl h-10 px-3 text-foreground outline-none"
              >
                <option value="" className="bg-card">No Parent (Root)</option>
                {allFlatResources
                  .filter(r => r.id !== editingResource?.id)
                  .map(r => (
                    <option key={r.id} value={r.id} className="bg-card">{r.name} ({r.code})</option>
                  ))
                }
              </select>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-between border-t border-border/5">
              <Button type="button" variant="outline" className="rounded-xl px-5" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold transition-all px-5 gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
