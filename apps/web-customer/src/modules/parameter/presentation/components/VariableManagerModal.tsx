import React, { useState, useEffect } from 'react';
import { Parameter, Variable, IStructureRepository } from '@kplian/core';
import { VariableRepositoryImpl } from '@kplian/infrastructure';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

interface VariableManagerModalProps {
  parameter: Parameter | null;
  isOpen: boolean;
  onClose: () => void;
}

const variableRepository = new VariableRepositoryImpl();

export const VariableManagerModal: React.FC<VariableManagerModalProps> = ({
  parameter,
  isOpen,
  onClose,
}) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [columnOrder, setColumnOrder] = useState('');
  const [primaryKey, setPrimaryKey] = useState(false);
  const [display, setDisplay] = useState(true);

  const fetchVariables = async () => {
    if (!parameter) return;
    setIsLoading(true);
    try {
      const data = await variableRepository.getByParameterId(parameter.id);
      setVariables(data || []);
    } catch (error) {
      console.error("Error fetching variables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && parameter) {
      fetchVariables();
      resetForm();
      setIsEditing(false);
    }
  }, [isOpen, parameter]);

  const resetForm = () => {
    setCode('');
    setName('');
    setType('');
    setColumnOrder('');
    setPrimaryKey(false);
    setDisplay(true);
    setSelectedVariable(null);
  };

  const handleEdit = (variable: Variable) => {
    setSelectedVariable(variable);
    setCode(variable.code);
    setName(variable.name);
    setType(variable.type);
    setColumnOrder(variable.columnOrder || '');
    setPrimaryKey(variable.primaryKey === 1);
    setDisplay(variable.display === 1);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this variable?")) return;
    try {
      await variableRepository.delete(id);
      fetchVariables();
    } catch (error) {
      console.error("Error deleting variable:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameter) return;

    const payload = {
      code,
      name,
      type,
      columnOrder: columnOrder || null,
      parameterId: parameter.id,
      primaryKey: primaryKey ? 1 : 0,
      display: display ? 1 : 0,
    };

    try {
      if (selectedVariable) {
        await variableRepository.update({
          ...payload,
          id: selectedVariable.id,
        });
      } else {
        await variableRepository.create(payload);
      }
      fetchVariables();
      resetForm();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving variable:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            Variables for parameter: <span className="text-primary font-semibold">{parameter?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="v-code">Code</Label>
                <Input
                  id="v-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. min_length"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-name">Name</Label>
                <Input
                  id="v-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Minimum Length"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="v-type">Type</Label>
                <Input
                  id="v-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. integer, string"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-order">Column Order</Label>
                <Input
                  id="v-order"
                  value={columnOrder}
                  onChange={(e) => setColumnOrder(e.target.value)}
                  placeholder="e.g. 1, 2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/10 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="v-pk"
                  checked={primaryKey}
                  onCheckedChange={setPrimaryKey}
                />
                <Label htmlFor="v-pk">Primary Key</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="v-display"
                  checked={display}
                  onCheckedChange={setDisplay}
                />
                <Label htmlFor="v-display">Display in List</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedVariable ? 'Update Variable' : 'Create Variable'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">List of fields/attributes configured for this parameter.</span>
              <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1">
                <Plus className="size-4" /> Add Variable
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="animate-spin size-5" /> Loading variables...
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/40 rounded-lg">
                  No variables defined for this parameter yet.
                </div>
              ) : (
                variables.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center p-3 border border-border/40 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{v.name}</span>
                        {v.primaryKey === 1 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">PK</span>
                        )}
                        {v.display === 1 && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-mono">Show</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground/60 space-x-2">
                        <span className="font-mono">{v.code}</span>
                        <span>•</span>
                        <span>{v.type}</span>
                        {v.columnOrder && (
                          <>
                            <span>•</span>
                            <span>Order: {v.columnOrder}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleEdit(v)}
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default VariableManagerModal;
