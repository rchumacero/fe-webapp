"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Loader2, Store, Folder, FolderOpen, ChevronRight, ChevronDown, CheckCircle2, XCircle, Users } from 'lucide-react';
import { StructureVendorRepositoryImpl, StructureRepositoryImpl, createApiClient } from '@kplian/infrastructure';
import { StructureVendor, Structure } from '@kplian/core';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const structureVendorRepo = new StructureVendorRepositoryImpl();
const structureRepo = new StructureRepositoryImpl();
const crmApi = createApiClient('crm');

export default function ParameterStructureVendorPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [structures, setStructures] = useState<Structure[]>([]);
  const [structureVendors, setStructureVendors] = useState<StructureVendor[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [selectedPersonCode, setSelectedPersonCode] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const fetchPersons = useCallback(async () => {
    try {
      const response = await crmApi.get<any>('/v1/persons');
      const resData = response.data;
      const list = Array.isArray(resData) ? resData : resData.data || resData.content || resData.results || [];
      setPersons(list);

      // Default select first person
      if (list.length > 0 && !selectedPersonCode) {
        setSelectedPersonCode(list[0].code);
      }
    } catch (error) {
      console.error('Error fetching CRM persons:', error);
      toast.error('Failed to load CRM vendors');
    }
  }, [selectedPersonCode]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const structData = await structureRepo.getAll();
      setStructures(structData || []);

      const vendorsData = await structureVendorRepo.getAll();
      setStructureVendors(vendorsData || []);
    } catch (error) {
      console.error('Error loading structures or vendors relations:', error);
      toast.error('Failed to load mapping data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
    fetchData();
  }, [fetchPersons, fetchData]);

  const handleToggleExpand = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleRelation = async (structureId: number | string) => {
    if (!selectedPersonCode) {
      toast.error('Please select a vendor first');
      return;
    }
    
    try {
      const existing = structureVendors.find(
        sv => sv.structureId === structureId && sv.vendorCode === selectedPersonCode
      );

      if (existing) {
        await structureVendorRepo.delete(existing.id);
        toast.success('Vendor mapping removed');
      } else {
        await structureVendorRepo.create({
          structureId,
          vendorCode: selectedPersonCode,
          status: 'ACTIVE'
        });
        toast.success('Vendor mapping added');
      }

      // Reload relationships
      const vendorsData = await structureVendorRepo.getAll();
      setStructureVendors(vendorsData || []);
    } catch (error: any) {
      console.error('Error toggling vendor mapping:', error);
      toast.error('Failed to update vendor mapping');
    }
  };

  const filteredPersons = persons.filter(p => {
    const q = searchQuery.toLowerCase();
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return name.includes(q) || (p.code || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  const selectedPerson = persons.find(p => p.code === selectedPersonCode);

  // Recursive Tree Node Renderer for parameter structure with Switch toggles
  const renderStructureNode = (node: Structure, level = 0) => {
    const children = structures.filter(s => s.parentId === node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.includes(node.id);
    const isAssigned = structureVendors.some(
      sv => sv.structureId === node.id && sv.vendorCode === selectedPersonCode
    );

    return (
      <div key={node.id} className="space-y-1">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 transition-colors">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button onClick={() => handleToggleExpand(node.id)} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="text-primary shrink-0" />
            ) : (
              <Folder size={16} className="text-muted-foreground shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{node.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{node.code}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-4 shrink-0">
            <span className={cn("text-[10px] uppercase font-bold tracking-wider", isAssigned ? "text-emerald-500" : "text-muted-foreground/50")}>
              {isAssigned ? 'Assigned' : 'Inactive'}
            </span>
            <Switch
              checked={isAssigned}
              onCheckedChange={() => handleToggleRelation(node.id)}
              disabled={!selectedPersonCode}
            />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="pl-4 ml-2 border-l border-border/20 space-y-1">
            {children.map(child => renderStructureNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" /> Parameter-Vendor Mapping
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure parameter structure authorization limits for CRM vendors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchData} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Vendor Selector */}
        <Card className="md:col-span-1 border-border/40 shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Store className="size-4 text-primary" /> CRM Vendors
            </CardTitle>
            <div className="relative w-full mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-8 h-9 text-xs bg-card border-border/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[60vh] space-y-2 pr-2">
            {filteredPersons.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No vendors found.</p>
            ) : (
              filteredPersons.map(person => {
                const isSelected = selectedPersonCode === person.code;
                const activeMappingsCount = structureVendors.filter(sv => sv.vendorCode === person.code).length;

                return (
                  <div
                    key={person.code}
                    onClick={() => setSelectedPersonCode(person.code)}
                    className={cn(
                      "p-3 rounded-xl border border-border/20 cursor-pointer transition-all duration-200 flex justify-between items-center",
                      isSelected
                        ? "bg-primary/10 border-primary/50 text-foreground font-semibold"
                        : "bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-bold text-foreground truncate">{person.firstName} {person.lastName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase truncate mt-0.5">{person.code}</p>
                    </div>
                    <Badge variant={activeMappingsCount > 0 ? "default" : "secondary"} className="text-[9px] uppercase">
                      {activeMappingsCount} Mapped
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right column: Parameter structure toggles */}
        <Card className="md:col-span-2 border-border/40 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle className="text-base font-semibold">
              Structure Permissions tree
            </CardTitle>
            {selectedPerson && (
              <p className="text-xs text-muted-foreground">
                Configuring permissions for: <span className="text-foreground font-bold">{selectedPerson.firstName} {selectedPerson.lastName} ({selectedPerson.code})</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[60vh] p-6 pr-2">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="animate-spin size-6 text-primary" />
                <span className="text-xs">Loading structures tree...</span>
              </div>
            ) : structures.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No structures configured.</p>
            ) : (
              <div className="space-y-1">
                {structures.filter(s => s.parentId === null).map(rootNode => renderStructureNode(rootNode))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
