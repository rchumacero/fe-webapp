"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { Structure, Parameter, StructureVendor } from '@kplian/core';
import {
  StructureRepositoryImpl,
  ParameterRepositoryImpl,
  StructureVendorRepositoryImpl
} from '@kplian/infrastructure';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Settings,
  FileText,
  Loader2,
  FolderTree,
  Store,
  CheckCircle2,
  XCircle,
  Database
} from 'lucide-react';
import StructureTree from '../components/StructureTree';
import VariableManagerModal from '../components/VariableManagerModal';
import { ParameterValueManagerModal } from '../components/ParameterValueManagerModal';
import { useVendor } from '@/hooks/use-vendor';
import { useSession } from 'next-auth/react';

const structureRepo = new StructureRepositoryImpl();
const parameterRepo = new ParameterRepositoryImpl();
const vendorRepo = new StructureVendorRepositoryImpl();

export default function ParameterStructurePage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const { data: session } = useSession();

  const [structures, setStructures] = useState<Structure[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [loadingParameters, setLoadingParameters] = useState(false);

  const [selectedStructureId, setSelectedStructureId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // Modals state
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isParameterModalOpen, setIsParameterModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isValuesModalOpen, setIsValuesModalOpen] = useState(false);

  const [editingStructure, setEditingStructure] = useState<Structure | null>(null);
  const [parentStructure, setParentStructure] = useState<Structure | null>(null);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);

  // Structure Form
  const [sCode, setSCode] = useState('');
  const [sName, setSName] = useState('');
  const [sIsPrivate, setSIsPrivate] = useState(false);
  const [sModuleCode, setSModuleCode] = useState('');

  // Parameter Form
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pType, setPType] = useState('list');

  // Vendor Mapping Modal State
  const [vendorMappings, setVendorMappings] = useState<StructureVendor[]>([]);
  const [mappingVendorCode, setMappingVendorCode] = useState('');
  const [mappingStatus, setMappingStatus] = useState('ACTIVE');
  const [loadingMappings, setLoadingMappings] = useState(false);

  const fetchStructures = useCallback(async () => {
    setLoadingStructures(true);
    try {
      const data = await structureRepo.getAll();
      setStructures(data || []);
    } catch (error) {
      console.error('Failed to fetch structures:', error);
    } finally {
      setLoadingStructures(false);
    }
  }, []);

  const fetchParameters = useCallback(async (structureId: number) => {
    setLoadingParameters(true);
    try {
      const data = await parameterRepo.getByStructureId(structureId);
      setParameters(data || []);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
    } finally {
      setLoadingParameters(false);
    }
  }, []);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  useEffect(() => {
    if (selectedStructureId !== null) {
      fetchParameters(selectedStructureId);
    } else {
      setParameters([]);
    }
  }, [selectedStructureId, fetchParameters]);

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectStructure = (id: number) => {
    setSelectedStructureId(id);
  };

  // Structure Operations
  const openAddStructure = () => {
    setEditingStructure(null);
    setParentStructure(null);
    setSCode('');
    setSName('');
    setSIsPrivate(false);
    setSModuleCode('');
    setIsStructureModalOpen(true);
  };

  const openAddChildStructure = (parent: Structure) => {
    setEditingStructure(null);
    setParentStructure(parent);
    setSCode('');
    setSName('');
    setSIsPrivate(false);
    setSModuleCode('');
    setIsStructureModalOpen(true);
  };

  const openEditStructure = (structure: Structure) => {
    setEditingStructure(structure);
    setParentStructure(null);
    setSCode(structure.code);
    setSName(structure.name);
    setSIsPrivate(structure.isPrivate === 1);
    setSModuleCode(structure.moduleCode || '');
    setIsStructureModalOpen(true);
  };

  const handleDeleteStructure = async (id: number) => {
    if (!confirm('Are you sure you want to delete this structure and all its child nodes?')) return;
    try {
      await structureRepo.delete(id);
      if (selectedStructureId === id) {
        setSelectedStructureId(null);
      }
      fetchStructures();
    } catch (error) {
      console.error('Failed to delete structure:', error);
    }
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userCode = (session?.user as any)?.username || session?.user?.email || 'rodrychm@gmail.com';
    const payload = {
      code: sCode,
      name: sName,
      isPrivate: sIsPrivate ? 1 : 0,
      parentId: parentStructure ? parentStructure.id : (editingStructure ? editingStructure.parentId : null),
      companyCode: userCode,
      moduleCode: sModuleCode || undefined,
    };

    try {
      if (editingStructure) {
        await structureRepo.update({ ...payload, id: editingStructure.id });
      } else {
        await structureRepo.create(payload);
      }
      fetchStructures();
      setIsStructureModalOpen(false);
    } catch (error) {
      console.error('Failed to save structure:', error);
    }
  };

  // Parameter Operations
  const openAddParameter = () => {
    if (!selectedStructureId) return;
    setEditingParameter(null);
    setPCode('');
    setPName('');
    setPDesc('');
    setPType('list');
    setIsParameterModalOpen(true);
  };

  const openEditParameter = (param: Parameter) => {
    setEditingParameter(param);
    setPCode(param.code);
    setPName(param.name);
    setPDesc(param.description || '');
    setPType(param.type);
    setIsParameterModalOpen(true);
  };

  const handleDeleteParameter = async (id: number) => {
    if (!confirm('Are you sure you want to delete this parameter?')) return;
    try {
      await parameterRepo.delete(id);
      if (selectedStructureId) {
        fetchParameters(selectedStructureId);
      }
    } catch (error) {
      console.error('Failed to delete parameter:', error);
    }
  };

  const handleParameterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStructureId) return;

    const structure = structures.find((s) => s.id === selectedStructureId);
    const parentCode = structure ? structure.code : '';
    const fullCode = parentCode ? `${parentCode}/${pCode.toUpperCase()}` : pCode.toUpperCase();

    const payload = {
      code: pCode,
      name: pName,
      description: pDesc || null,
      type: pType,
      structureId: selectedStructureId,
      fullCode,
    };

    try {
      if (editingParameter) {
        await parameterRepo.update({ ...payload, id: editingParameter.id });
      } else {
        await parameterRepo.create(payload);
      }
      fetchParameters(selectedStructureId);
      setIsParameterModalOpen(false);
    } catch (error) {
      console.error('Failed to save parameter:', error);
    }
  };

  // Vendor Mappings
  const openVendorModal = async (structure: Structure) => {
    setParentStructure(structure);
    setMappingVendorCode('');
    setMappingStatus('ACTIVE');
    setIsVendorModalOpen(true);
    fetchVendorMappings(structure.id);
  };

  const fetchVendorMappings = async (structureId: number) => {
    setLoadingMappings(true);
    try {
      const data = await vendorRepo.getByStructureId(structureId);
      setVendorMappings(data || []);
    } catch (error) {
      console.error('Failed to fetch vendor mappings:', error);
    } finally {
      setLoadingMappings(false);
    }
  };

  const handleAddVendorMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentStructure) return;

    try {
      await vendorRepo.create({
        structureId: parentStructure.id,
        vendorCode: mappingVendorCode,
        status: mappingStatus,
      });
      fetchVendorMappings(parentStructure.id);
      setMappingVendorCode('');
    } catch (error) {
      console.error('Failed to create vendor mapping:', error);
    }
  };

  const handleDeleteVendorMapping = async (id: number) => {
    try {
      await vendorRepo.delete(id);
      if (parentStructure) {
        fetchVendorMappings(parentStructure.id);
      }
    } catch (error) {
      console.error('Failed to delete vendor mapping:', error);
    }
  };

  const selectedStructure = structures.find((s) => s.id === selectedStructureId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Top Page Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parámetros</h1>
          <p className="text-sm text-muted-foreground">Gestiona la estructura jerárquica los parámetros</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStructures}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className={loadingStructures ? 'animate-spin size-5' : 'size-5'} />
          </Button>
          <Button
            size="icon"
            onClick={openAddStructure}
            className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md"
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel: Structures Tree */}
        <Card className="md:col-span-1 shadow-sm border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FolderTree className="size-4 text-primary" /> Estructura
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[60vh] overflow-y-auto pr-2">
            {loadingStructures ? (
              <div className="flex flex-col justify-center items-center h-full text-muted-foreground gap-2">
                <Loader2 className="animate-spin size-6 text-primary" />
                <span className="text-xs">Cargando estructura...</span>
              </div>
            ) : structures.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground p-4">
                <span>No structures defined.</span>
                <Button size="sm" onClick={openAddStructure} className="mt-2">
                  Add Root Node
                </Button>
              </div>
            ) : (
              <StructureTree
                structures={structures}
                parentId={null}
                selectedId={selectedStructureId}
                expandedIds={expandedIds}
                onSelect={handleSelectStructure}
                onToggleExpand={handleToggleExpand}
                onAddChild={openAddChildStructure}
                onEdit={openEditStructure}
                onDelete={handleDeleteStructure}
                onManageVendors={openVendorModal}
              />
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Parameters List */}
        <Card className="md:col-span-2 shadow-sm border-border/40 flex flex-col">
          {selectedStructureId === null ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 min-h-[50vh] text-muted-foreground">
              <div className="bg-muted p-4 rounded-full mb-4">
                <FileText className="size-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Selecciona una estructura para ver sus parámetros</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                Haz clic en una estructura del árbol para ver sus parámetros
              </p>
              <Button onClick={openAddStructure} className="gap-2">
                <Plus className="size-4" /> Agregar Estructura Raíz
              </Button>
            </div>
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Parámetros de la estructura
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-mono">
                    {selectedStructure?.name} ({selectedStructure?.code})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => selectedStructure && openAddChildStructure(selectedStructure)}
                  >
                    <Plus className="size-3.5" /> Agregar Subestructura
                  </Button>
                  <Button size="icon" className="rounded-full size-8" onClick={openAddParameter} title="Agregar Parámetro">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
                {loadingParameters ? (
                  <div className="flex justify-center items-center py-12 text-muted-foreground gap-2">
                    <Loader2 className="animate-spin size-6 text-primary" />
                    <span>Cargando parámetros...</span>
                  </div>
                ) : parameters.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border/40 rounded-lg">
                    No parameters found inside this structure node.
                  </div>
                ) : (
                  parameters.map((param) => (
                    <Card
                      key={param.id}
                      className="border-border/30 hover:border-border/60 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-4 flex justify-between items-start">
                        <div className="space-y-1 flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground">{param.name}</h4>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                              {param.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground/60 font-mono tracking-wider">
                            Code: <span className="text-foreground">{param.code}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {param.description || 'No description provided'}
                          </p>
                          <div className="pt-2">
                            <span className="text-[10px] bg-secondary/80 text-secondary-foreground font-mono px-2 py-0.5 rounded uppercase">
                              {param.fullCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditParameter(param)}>
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setSelectedParameter(param);
                              setIsVariableModalOpen(true);
                            }}
                            title="Manage Variables"
                          >
                            <Settings className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedParameter(param);
                              setIsValuesModalOpen(true);
                            }}
                            title="Manage Values"
                          >
                            <Database className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteParameter(param.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Structure Modal */}
      <Dialog open={isStructureModalOpen} onOpenChange={setIsStructureModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? 'Edit Structure' : parentStructure ? `Add Child under ${parentStructure.name}` : 'Create Root Structure'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStructureSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="s-code">Code</Label>
              <Input
                id="s-code"
                value={sCode}
                onChange={(e) => setSCode(e.target.value)}
                placeholder="e.g. GEN, SEC, VAL"
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-name">Name</Label>
              <Input
                id="s-name"
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                placeholder="e.g. General, Security"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-modulecode">Module Code</Label>
              <Input
                id="s-modulecode"
                value={sModuleCode}
                onChange={(e) => setSModuleCode(e.target.value)}
                placeholder="e.g. CRM, warehouse"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="s-private" checked={sIsPrivate} onCheckedChange={setSIsPrivate} />
              <Label htmlFor="s-private">Is Private Structure</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsStructureModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Parameter Modal */}
      <Dialog open={isParameterModalOpen} onOpenChange={setIsParameterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingParameter ? 'Edit Parameter' : 'Create Parameter'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleParameterSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-code">Code</Label>
                <Input
                  id="p-code"
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value)}
                  placeholder="e.g. max_length"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-type">Type</Label>
                <Input
                  id="p-type"
                  value={pType}
                  onChange={(e) => setPType(e.target.value)}
                  placeholder="e.g. string, list, boolean"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. Maximum Length"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Description</Label>
              <Input
                id="p-desc"
                value={pDesc}
                onChange={(e) => setPDesc(e.target.value)}
                placeholder="Brief description of parameter usage"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsParameterModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Mappings Modal */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Vendors for Structure: {parentStructure?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pt-2 pr-1">
            <form onSubmit={handleAddVendorMapping} className="flex gap-2 items-end border-b border-border/10 pb-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="v-map-code">Vendor Code</Label>
                <Input
                  id="v-map-code"
                  value={mappingVendorCode}
                  onChange={(e) => setMappingVendorCode(e.target.value)}
                  placeholder="e.g. VEND_01"
                  required
                />
              </div>
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>

            <div className="space-y-2">
              <Label>Active Mappings</Label>
              {loadingMappings ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs py-4">
                  <Loader2 className="animate-spin size-4" /> Loading vendor mappings...
                </div>
              ) : vendorMappings.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded">
                  No vendor mappings defined yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {vendorMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex justify-between items-center p-2 border rounded hover:bg-accent/10 transition-all text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="size-4 text-primary shrink-0" />
                        <span className="font-mono">{mapping.vendorCode}</span>
                        {mapping.status === 'ACTIVE' ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-rose-500" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteVendorMapping(mapping.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variable Manager Modal (Grandchild Variable entities) */}
      <VariableManagerModal
        parameter={selectedParameter}
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
      />

      {/* Value Manager Modal (Transposed row records) */}
      <ParameterValueManagerModal
        parameter={selectedParameter}
        isOpen={isValuesModalOpen}
        onClose={() => setIsValuesModalOpen(false)}
      />
    </div>
  );
}
