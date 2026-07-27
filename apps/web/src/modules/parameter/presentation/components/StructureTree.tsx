import React from 'react';
import { Structure } from '@kplian/core';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit2, Trash2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StructureTreeProps {
  structures: Structure[];
  parentId: number | null;
  selectedId: number | null;
  expandedIds: number[];
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (parent: Structure) => void;
  onEdit: (structure: Structure) => void;
  onDelete: (id: number) => void;
  onManageVendors: (structure: Structure) => void;
  level?: number;
}

export const StructureTree: React.FC<StructureTreeProps> = ({
  structures,
  parentId,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onManageVendors,
  level = 0,
}) => {
  const currentNodes = structures.filter((node) => node.parentId === parentId);

  if (currentNodes.length === 0) return null;

  return (
    <div className={cn("space-y-1", level > 0 && "pl-4 ml-2 border-l border-border/20")}>
      {currentNodes.map((node) => {
        const hasChildren = structures.some((child) => child.parentId === node.id);
        const isExpanded = expandedIds.includes(node.id);
        const isSelected = selectedId === node.id;

        return (
          <div key={node.id} className="space-y-1">
            <div
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onSelect(node.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(node.id);
                    }}
                    className="p-0.5 rounded hover:bg-accent/60 text-muted-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                ) : (
                  <div className="size-5" />
                )}
                
                {isExpanded ? (
                  <FolderOpen className={cn("size-5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                ) : (
                  <Folder className={cn("size-5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate font-medium">{node.name}</span>
                  <span className="text-xs text-muted-foreground/60 tracking-wider truncate font-mono uppercase">{node.code}</span>
                </div>
              </div>

              {/* Action buttons shown on hover or when selected */}
              <div className={cn(
                "flex items-center gap-1 shrink-0 transition-opacity duration-200",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-accent"
                  onClick={() => onAddChild(node)}
                  title="Add child structure"
                >
                  <Plus className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-accent"
                  onClick={() => onEdit(node)}
                  title="Edit structure"
                >
                  <Edit2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(node.id)}
                  title="Delete structure"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-accent"
                  onClick={() => onManageVendors(node)}
                  title="Manage vendors"
                >
                  <Globe className="size-3.5" />
                </Button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <StructureTree
                structures={structures}
                parentId={node.id}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageVendors={onManageVendors}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
export default StructureTree;
