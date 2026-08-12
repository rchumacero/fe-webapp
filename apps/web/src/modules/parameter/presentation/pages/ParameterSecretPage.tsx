"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Plus, Search, Loader2, Trash2, Edit2, Eye, EyeOff, MoreHorizontal, Key, FileText, Lock } from 'lucide-react';
import { SecretRepositoryImpl } from '@kplian/infrastructure';
import { Secret } from '@kplian/core';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';

const secretRepo = new SecretRepositoryImpl();

export default function ParameterSecretPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string | number, boolean>>({});

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchSecrets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await secretRepo.getAll();
      setSecrets(data || []);
    } catch (error) {
      console.error('Error loading secrets:', error);
      toast.error('Failed to load secrets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const toggleVisibility = (id: string | number) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openCreateModal = () => {
    setSelectedSecret(null);
    setFormCode('');
    setFormName('');
    setFormValue('');
    setFormDescription('');
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (secret: Secret) => {
    setSelectedSecret(secret);
    setFormCode(secret.code);
    setFormName(secret.name);
    setFormValue(secret.value || '');
    setFormDescription(secret.description || '');
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || !formValue.trim()) {
      toast.error('Code, Name and Value are required');
      return;
    }

    setLoading(true);
    try {
      const userCode = (session?.user as any)?.username || session?.user?.email || 'rodrychm@gmail.com';
      const payload = {
        code: formCode.toUpperCase(),
        name: formName,
        value: formValue,
        description: formDescription || null,
        vendorCode: userCode
      };

      if (modalMode === 'create') {
        await secretRepo.create(payload);
        toast.success('Secret created successfully');
      } else if (modalMode === 'edit' && selectedSecret) {
        await secretRepo.update({
          ...payload,
          id: selectedSecret.id
        });
        toast.success('Secret updated successfully');
      }
      setModalOpen(false);
      fetchSecrets();
    } catch (error) {
      console.error('Error saving secret:', error);
      toast.error('Failed to save secret');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this secret?')) {
      setLoading(true);
      try {
        await secretRepo.delete(id);
        toast.success('Secret deleted successfully');
        fetchSecrets();
      } catch (error) {
        console.error('Error deleting secret:', error);
        toast.error('Failed to delete secret');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredSecrets = secrets.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="size-6 text-primary" /> Secrets Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure and manage secure environment parameters</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchSecrets} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button size="icon" onClick={openCreateModal} className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search secrets..."
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && secrets.length === 0 ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredSecrets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10">
          <p className="text-muted-foreground">No secrets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSecrets.map((secret) => {
            const isVisible = visibleSecrets[secret.id];
            return (
              <Card
                key={secret.id}
                className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{secret.code}</p>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground">
                      {secret.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
                      <DropdownMenuItem onClick={() => openEditModal(secret)} className="cursor-pointer text-foreground">
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(secret.id)} className="text-destructive cursor-pointer focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 pb-4 flex-1">
                  <div className="flex flex-col gap-y-2">
                    {/* Secret Value field */}
                    <div className="flex items-center justify-between bg-accent/20 rounded-xl p-3 border border-border/20">
                      <code className="text-sm font-mono text-foreground break-all">
                        {isVisible ? secret.value : '••••••••••••••••'}
                      </code>
                      <Button variant="ghost" size="icon" onClick={() => toggleVisibility(secret.id)} className="h-8 w-8 rounded-full ml-2 text-muted-foreground hover:text-foreground">
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>

                    {secret.description && (
                      <p className="text-xs text-muted-foreground italic flex items-start gap-1">
                        <FileText size={12} className="shrink-0 mt-0.5" />
                        {secret.description}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="py-2 border-t border-border/5 text-[9px] text-muted-foreground/45 flex justify-between font-medium">
                  <span>ID: {secret.id}</span>
                  <span className="truncate max-w-[120px]">By: {secret.vendorCode || 'System'}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Secret Creation / Editing Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Create New Secret' : 'Edit Secret'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sec-code">Code</Label>
              <Input
                id="sec-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. STRIPE_API_KEY"
                required
                disabled={modalMode === 'edit'}
                className="uppercase font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sec-name">Name</Label>
              <Input
                id="sec-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Stripe API Key"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sec-value">Secret Value</Label>
              <Input
                id="sec-value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Enter sensitive secret value"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sec-desc">Description</Label>
              <Input
                id="sec-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe secret usage"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
