"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useSession } from 'next-auth/react';
import {
  StructureRepositoryImpl,
  ParameterRepositoryImpl,
  VariableRepositoryImpl,
  ParameterValueRepositoryImpl
} from '@kplian/infrastructure';
import { Structure, Parameter, Variable } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Database,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const structureRepo = new StructureRepositoryImpl();
const parameterRepo = new ParameterRepositoryImpl();
const variableRepo = new VariableRepositoryImpl();
const parameterValueRepo = new ParameterValueRepositoryImpl();

interface ParameterSelectProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  parameterCode: string;
  placeholder?: string;
}

const ParameterSelect: React.FC<ParameterSelectProps> = ({
  id,
  value,
  onChange,
  parameterCode,
  placeholder = 'Seleccione una opción'
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const batchData = await parameterValueRepo.getTransposedBatch(parameterCode, "");
        let rows: any[] = [];
        if (Array.isArray(batchData)) {
          if (batchData[0] && Array.isArray(batchData[0].values)) {
            rows = batchData[0].values;
          } else {
            rows = batchData;
          }
        } else if (batchData && typeof batchData === 'object') {
          if (Array.isArray(batchData[parameterCode])) {
            rows = batchData[parameterCode];
          } else {
            const values = Object.values(batchData);
            if (values.length > 0 && Array.isArray(values[0])) {
              rows = values[0] as any[];
            }
          }
        }
        if (active) {
          setOptions(rows);
        }
      } catch (err) {
        console.error("Failed to load options for custom select:", parameterCode, err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOptions();
    return () => {
      active = false;
    };
  }, [parameterCode]);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:border-primary/40 text-foreground"
    >
      <option value="">{loading ? 'Cargando...' : placeholder}</option>
      {options.map((opt, idx) => {
        const val = opt.KEY ?? opt.CODE ?? opt.VALUE ?? opt.ID ?? opt.code ?? opt.value ?? opt.id ?? opt.valueStr ?? opt.fullCode ?? opt;
        const label = opt.NAME || opt.name || opt.label || opt.description || opt.valueStr || val || `Item ${idx}`;
        return (
          <option key={`${val}-${idx}`} value={val} className="text-foreground bg-card">
            {label}
          </option>
        );
      })}
    </select>
  );
};

interface ParameterCustomPageProps {
  moduleCode: string;
}

export default function ParameterCustomPage({ moduleCode }: ParameterCustomPageProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userCode = (session?.user as any)?.username || session?.user?.email || 'rodrychm@gmail.com';

  const [structures, setStructures] = useState<Structure[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Structure[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Selection/Values details states
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [transposedRows, setTransposedRows] = useState<any[]>([]);

  // CRUD states inside modal
  const [isValuesFormActive, setIsValuesFormActive] = useState(false);
  const [valuesModalMode, setValuesModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [valuesFormFields, setValuesFormFields] = useState<Record<string | number, string>>({});

  // 1. Fetch structure roots for the moduleCode
  const fetchData = useCallback(async () => {
    setLoading(true);
    setHasLoadedAll(false);
    try {
      // Get root structures only for the specified moduleCode
      const rootStructures = await structureRepo.getRootsByModuleCode(moduleCode);
      setStructures(rootStructures);
    } catch (error) {
      console.error('Error fetching parameterized structure data:', error);
      toast.error('No se pudieron cargar los datos de las estructuras.');
    } finally {
      setLoading(false);
    }
  }, [moduleCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Current level structures (folders)
  const currentStructures = structures.filter(s => s.parentId === currentParentId);

  // Fetch parameters under selected structure (folder)
  const fetchParameters = useCallback(async (structureId: string | number) => {
    setLoading(true);
    try {
      const data = await parameterRepo.getByStructureId(structureId);
      setParameters(data || []);
    } catch (error) {
      console.error('Error loading parameters:', error);
      toast.error('No se pudieron cargar los parámetros.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStructureClick = async (structure: Structure) => {
    setBreadcrumbs(prev => [...prev, structure]);
    setCurrentParentId(structure.id);
    setParameters([]);

    // Load children normally using full structures list if not already loaded
    if (!hasLoadedAll) {
      setLoading(true);
      try {
        const allStructures = await structureRepo.getAll();
        const filteredStructures = allStructures.filter(s => 
          s.moduleCode?.toLowerCase() === moduleCode?.toLowerCase()
        );
        
        setStructures(filteredStructures);
        setHasLoadedAll(true);
      } catch (error) {
        console.error('Error loading child structures:', error);
        toast.error('No se pudieron cargar las subestructuras.');
      } finally {
        setLoading(false);
      }
    }

    fetchParameters(structure.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentParentId(null);
      setParameters([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const target = breadcrumbs[index];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentParentId(target.id);
      setParameters([]);
      fetchParameters(target.id);
    }
  };

  // Helper to parse transposed rows from API response formats
  const parseTransposedRows = (batchData: any, fullCode: string): any[] => {
    let rows: any[] = [];
    if (Array.isArray(batchData)) {
      if (batchData[0] && Array.isArray(batchData[0].values)) {
        rows = batchData[0].values;
      } else {
        rows = batchData;
      }
    } else if (batchData && typeof batchData === 'object') {
      if (Array.isArray(batchData[fullCode])) {
        rows = batchData[fullCode];
      } else {
        const values = Object.values(batchData);
        if (values.length > 0 && Array.isArray(values[0])) {
          rows = values[0] as any[];
        }
      }
    }
    return rows;
  };

  // Reload transposed values row details
  const reloadTransposedRows = async (fullCode: string) => {
    try {
      const batchData = await parameterValueRepo.getTransposedBatch(fullCode, userCode);
      const rows = parseTransposedRows(batchData, fullCode);
      setTransposedRows(rows);
    } catch (error) {
      console.error('Error reloading transposed rows:', error);
    }
  };

  const handleParamClick = async (param: Parameter) => {
    setSelectedParam(param);
    setLoading(true);
    try {
      // Load variables
      const vars = await variableRepo.getByParameterId(param.id);
      setVariables(vars || []);

      // Load transposed values filtered by userCode
      const batchData = await parameterValueRepo.getTransposedBatch(param.fullCode, userCode);
      const rows = parseTransposedRows(batchData, param.fullCode);
      setTransposedRows(rows);

      setShowValuesModal(true);
    } catch (error) {
      console.error('Error loading parameter values detail:', error);
      toast.error('No se pudieron cargar los detalles del parámetro.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare and open Values Creation Form
  const openCreateValuesRowModal = () => {
    setValuesModalMode('create');
    setSelectedRowNumber(null);
    const initialFields: Record<string | number, string> = {};
    for (const v of variables) {
      initialFields[v.id] = '';
    }
    setValuesFormFields(initialFields);
    setIsValuesFormActive(true);
  };

  // Prepare and open Values Edit Form
  const openEditValuesRowModal = async (rowNum: number) => {
    setValuesModalMode('edit');
    setSelectedRowNumber(rowNum);
    setLoading(true);
    try {
      const fields: Record<string | number, string> = {};
      for (const v of variables) {
        const vals = await parameterValueRepo.getByVariableId(v.id);
        const match = vals.find(val => val.row === rowNum && val.vendorCode === userCode);
        fields[v.id] = match ? match.value : '';
      }
      setValuesFormFields(fields);
      setIsValuesFormActive(true);
    } catch (error) {
      console.error('Error preparing values edit form:', error);
      toast.error('No se pudieron cargar los datos del registro.');
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Values Row
  const handleSaveValuesRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParam) return;
    setLoading(true);
    try {
      const viewRoute = `/parameter/custom/${moduleCode}`;
      let dataset: any[] = [];

      if (valuesModalMode === 'create') {
        dataset = variables.map(v => ({
          [v.code]: valuesFormFields[v.id] || ""
        }));
        await parameterValueRepo.createTransposedRow(String(selectedParam.id), userCode, dataset, viewRoute);
        toast.success('Registro creado correctamente.');
      } else if (valuesModalMode === 'edit' && selectedRowNumber !== null) {
        const rowObj: any = { row: selectedRowNumber };
        variables.forEach(v => {
          rowObj[v.code] = valuesFormFields[v.id] || "";
        });
        dataset = [rowObj];
        await parameterValueRepo.updateTransposedRow(String(selectedParam.id), userCode, dataset, viewRoute);
        toast.success('Registro actualizado correctamente.');
      }

      setIsValuesFormActive(false);
      setValuesModalMode(null);
      setSelectedRowNumber(null);
      await reloadTransposedRows(selectedParam.fullCode);
    } catch (error) {
      console.error('Error saving transposed row:', error);
      toast.error('No se pudo guardar el registro.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Transposed Values Row
  const handleDeleteValuesRow = async (rowNum: number) => {
    if (!selectedParam) return;
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;

    setLoading(true);
    try {
      await parameterValueRepo.deleteTransposedRow(String(selectedParam.id), userCode, rowNum);
      toast.success('Registro eliminado correctamente.');
      await reloadTransposedRows(selectedParam.fullCode);
    } catch (error) {
      console.error('Error deleting values row:', error);
      toast.error('No se pudo eliminar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8">
      {/* Top Page Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parámetros de {moduleCode.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">Administración de parámetros de negocio para el módulo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin size-5' : 'size-5'} />
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation Header */}
      <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 rounded-lg border border-border/30 text-sm">
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className={`font-semibold transition-colors ${currentParentId === null ? 'text-foreground' : 'text-primary hover:underline'}`}
        >
          Inicio
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            <span className="text-muted-foreground/60">/</span>
            <button
              onClick={() => handleBreadcrumbClick(idx)}
              className={`font-semibold transition-colors ${idx === breadcrumbs.length - 1 ? 'text-foreground' : 'text-primary hover:underline'}`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && structures.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        )}

        {/* Level contents layout */}
        {!loading && currentStructures.length === 0 && parameters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
            <FolderOpen className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="font-semibold text-lg">No hay elementos</h3>
            <p className="text-sm text-muted-foreground">No se encontraron carpetas ni parámetros en este nivel.</p>
          </div>
        )}

        {/* Render Folder Nodes */}
        {currentStructures.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Carpetas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentStructures.map(structure => (
                <Card
                  key={structure.id}
                  className="hover:shadow-md border-border/40 hover:border-primary/40 cursor-pointer transition-all duration-200"
                  onClick={() => handleStructureClick(structure)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{structure.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">Código: {structure.code}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Render Parameter list in current directory */}
        {parameters.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Parámetros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map(param => (
                <Card
                  key={param.id}
                  className="hover:shadow-md border-border/40 hover:border-primary/40 cursor-pointer transition-all duration-200"
                  onClick={() => handleParamClick(param)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-secondary rounded-lg text-secondary-foreground shrink-0 mt-1">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground truncate">{param.name}</h4>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {param.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Código: {param.code}</p>
                      {param.description && (
                        <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2">{param.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Values Details dialog */}
      <Dialog open={showValuesModal} onOpenChange={setShowValuesModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-card border-border/40 text-foreground">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {isValuesFormActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 mr-1"
                  onClick={() => {
                    setIsValuesFormActive(false);
                    setValuesModalMode(null);
                  }}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <Database className="size-5 text-primary" />
              <span>{isValuesFormActive ? (valuesModalMode === 'create' ? "Nuevo Registro" : `Editar Registro`) : `${selectedParam?.name}`}</span>
            </DialogTitle>
            {!isValuesFormActive && (
              <Button size="sm" onClick={openCreateValuesRowModal} className="gap-1 h-8">
                <Plus className="size-4" /> Agregar Registro
              </Button>
            )}
          </DialogHeader>

          {isValuesFormActive ? (
            <form onSubmit={handleSaveValuesRow} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {variables.map((v) => {
                  let isParameterDropdown = false;
                  let parameterCode = '';

                  try {
                    if (v.type && v.type.trim().startsWith('{')) {
                      const parsed = JSON.parse(v.type);
                      if (parsed.dataType === 'parameter') {
                        isParameterDropdown = true;
                        parameterCode = parsed.code;
                      }
                    } else if (v.type === 'parameter') {
                      isParameterDropdown = true;
                      parameterCode = v.code;
                    }
                  } catch (e) {
                    console.error("Failed to parse variable type JSON:", e);
                  }

                  return (
                    <div key={v.id} className="space-y-2">
                      <Label htmlFor={`field-${v.id}`} className="font-semibold">{v.name} ({v.code})</Label>
                      {isParameterDropdown ? (
                        <ParameterSelect
                          id={`field-${v.id}`}
                          value={valuesFormFields[v.id] || ''}
                          onChange={(val) => setValuesFormFields(prev => ({ ...prev, [v.id]: val }))}
                          parameterCode={parameterCode}
                          placeholder={`Seleccione ${v.name}`}
                        />
                      ) : (
                        <Input
                          id={`field-${v.id}`}
                          value={valuesFormFields[v.id] || ''}
                          onChange={(e) => setValuesFormFields(prev => ({ ...prev, [v.id]: e.target.value }))}
                          placeholder={`Ingrese ${v.name}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter className="pt-6 border-t border-border/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsValuesFormActive(false);
                    setValuesModalMode(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-auto mt-4 pr-1">
                {transposedRows.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border/40 rounded-lg">
                    No hay valores registrados. Haz clic en 'Agregar Registro' para comenzar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    {transposedRows.map((row, idx) => (
                      <Card
                        key={idx}
                        className="border-border/30 hover:border-border/60 hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-border/10 pb-2">
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              FILA #{row.row}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-md"
                                onClick={() => openEditValuesRowModal(row.row)}
                              >
                                <Edit className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteValuesRow(row.row)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            {variables.map((v) => (
                              <div key={v.id} className="flex justify-between items-start gap-4">
                                <span className="text-muted-foreground font-medium shrink-0">{v.name}:</span>
                                <span className="font-mono text-foreground font-semibold break-all text-right">{row[v.code] || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
