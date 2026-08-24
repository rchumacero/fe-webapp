import React, { useState, useEffect } from 'react';
import { Parameter, Variable } from '@kplian/core';
import { VariableRepositoryImpl, ParameterValueRepositoryImpl } from '@kplian/infrastructure';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, TableProperties, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';

interface ParameterValueManagerModalProps {
  parameter: Parameter | null;
  isOpen: boolean;
  onClose: () => void;
}

const variableRepo = new VariableRepositoryImpl();
const parameterValueRepo = new ParameterValueRepositoryImpl();

export const ParameterValueManagerModal: React.FC<ParameterValueManagerModalProps> = ({
  parameter,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const [variables, setVariables] = useState<Variable[]>([]);
  const [transposedRows, setTransposedRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingRow, setIsEditingRow] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);

  // Form states
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [selectedRowVendorCode, setSelectedRowVendorCode] = useState<string>("null");
  const [valuesFormFields, setValuesFormFields] = useState<Record<string | number, string>>({});

  const loadData = async () => {
    if (!parameter) return;
    setIsLoading(true);
    try {
      // 1. Fetch variables
      const vars = await variableRepo.getByParameterId(parameter.id);
      setVariables(vars || []);

      // 2. Fetch transposed values
      const batchData = (await parameterValueRepo.getTransposedBatch(parameter.fullCode, "")) as any;
      let rows: any[] = [];
      if (Array.isArray(batchData)) {
        rows = batchData;
      } else if (batchData && typeof batchData === 'object') {
        if (Array.isArray(batchData[parameter.fullCode])) {
          rows = batchData[parameter.fullCode];
        } else {
          const values = Object.values(batchData);
          if (values.length > 0 && Array.isArray(values[0])) {
            rows = values[0] as any[];
          }
        }
      }
      setTransposedRows(rows);
    } catch (error) {
      console.error("Error loading transposed values:", error);
      toast.error("Failed to load parameter records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && parameter) {
      loadData();
      setIsEditingRow(false);
      setModalMode(null);
    }
  }, [isOpen, parameter]);

  const openCreateRow = () => {
    setModalMode('create');
    setSelectedRowNumber(null);
    setSelectedRowVendorCode("null");
    const fields: Record<string | number, string> = {};
    variables.forEach(v => {
      fields[v.id] = '';
    });
    setValuesFormFields(fields);
    setIsEditingRow(true);
  };

  const openEditRow = async (rowNum: number) => {
    setIsLoading(true);
    try {
      const fields: Record<string | number, string> = {};
      let resolvedVendor = "null";
      
      for (const v of variables) {
        const vals = await parameterValueRepo.getByVariableId(v.id);
        const match = vals.find(val => val.row === rowNum);
        fields[v.id] = match ? match.value : '';
        if (match && match.vendorCode) {
          resolvedVendor = match.vendorCode;
        }
      }

      setSelectedRowVendorCode(resolvedVendor);
      setValuesFormFields(fields);
      setSelectedRowNumber(rowNum);
      setModalMode('edit');
      setIsEditingRow(true);
    } catch (error) {
      console.error("Error loading row details:", error);
      toast.error("Failed to load row details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = async (rowNum: number) => {
    if (!parameter) return;
    if (!confirm(`Are you sure you want to delete row ${rowNum}?`)) return;

    setIsLoading(true);
    try {
      let resolvedVendor = "null";
      if (variables.length > 0) {
        const vals = await parameterValueRepo.getByVariableId(variables[0].id);
        const match = vals.find(val => val.row === rowNum);
        if (match && match.vendorCode) {
          resolvedVendor = match.vendorCode;
        }
      }
      await parameterValueRepo.deleteTransposedRow(String(parameter.id), resolvedVendor, rowNum);
      toast.success("Record deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameter) return;

    setIsLoading(true);
    try {
      const userCode = (session?.user as any)?.username || session?.user?.email || 'rodrychm@gmail.com';
      
      if (modalMode === 'create') {
        const dataset = variables.map(v => ({
          [v.code]: valuesFormFields[v.id] || ""
        }));
        await parameterValueRepo.createTransposedRow(String(parameter.id), userCode, dataset, "/parameter/structure");
        toast.success("Record created successfully");
      } else if (modalMode === 'edit' && selectedRowNumber !== null) {
        const rowObj: any = { row: selectedRowNumber };
        variables.forEach(v => {
          rowObj[v.code] = valuesFormFields[v.id] || "";
        });
        const dataset = [rowObj];
        const vCode = selectedRowVendorCode === "null" ? "" : selectedRowVendorCode;
        await parameterValueRepo.updateTransposedRow(String(parameter.id), vCode, dataset, "/parameter/structure");
        toast.success("Record updated successfully");
      }

      setIsEditingRow(false);
      setModalMode(null);
      loadData();
    } catch (error) {
      console.error("Error saving row:", error);
      toast.error("Failed to save values");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-card border-border/40 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {isEditingRow && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setIsEditingRow(false);
                  setModalMode(null);
                }}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <Database className="size-5 text-primary" />
            Values for: <span className="text-primary font-semibold">{parameter?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading && !isEditingRow ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : isEditingRow ? (
          <form onSubmit={handleSubmitRow} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {variables.map((v) => (
                <div key={v.id} className="space-y-2">
                  <Label htmlFor={`field-${v.id}`} className="capitalize">{v.name || v.code}</Label>
                  <Input
                    id={`field-${v.id}`}
                    value={valuesFormFields[v.id] || ''}
                    onChange={(e) => setValuesFormFields(prev => ({
                      ...prev,
                      [v.id]: e.target.value
                    }))}
                    placeholder={`Enter ${v.name || v.code}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditingRow(false);
                setModalMode(null);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Save Record
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex justify-between items-center pb-4 border-b border-border/10">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Records list ({transposedRows.length})
              </span>
              <Button size="sm" onClick={openCreateRow} className="gap-1.5 h-8">
                <Plus className="size-4" /> Add Record
              </Button>
            </div>

            <div className="flex-1 overflow-auto mt-4 pr-1">
              {transposedRows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border/40 rounded-lg">
                  No records stored for this parameter. Click 'Add Record' to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {transposedRows.map((row, index) => {
                    const rowNum = row.row;
                    return (
                      <Card
                        key={index}
                        className="border-border/30 hover:border-border/60 hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-border/5 pb-2">
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              ROW #{rowNum}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-md"
                                onClick={() => openEditRow(rowNum)}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteRow(rowNum)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            {variables.map((v) => (
                              <div key={v.id} className="flex justify-between items-start gap-4">
                                <span className="text-muted-foreground font-medium capitalize shrink-0">{v.name || v.code}:</span>
                                <span className="font-mono text-foreground font-semibold break-all text-right">{row[v.code] || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
