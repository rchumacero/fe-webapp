"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import { ORGANIZATION_CONSTANTS } from '../../constants/organization-constants';
import { OrganizationRepositoryImpl } from '../../infrastructure/repositories/OrganizationRepositoryImpl';
import { Organization } from '../../domain/entities/Organization';
import {
  Building2,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORGANIZATION_ROUTES } from '../../routes/organization-routes';
import { PERSON_ROUTES } from '../../../person/routes/person-routes';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OrganizationFormPage } from './OrganizationFormPage';

const organizationRepository = new OrganizationRepositoryImpl();

interface TreeNode extends Organization {
  children: TreeNode[];
}

interface OrganizationTreePageProps {
  personId: string;
}

export const OrganizationTreePage = ({ personId }: OrganizationTreePageProps) => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getAllByPersonId(personId);
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Error loading organizations");
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const treeData = useMemo(() => {
    const nodes: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    // First pass: create all nodes
    organizations.forEach(org => {
      nodes[org.id] = { ...org, children: [] };
    });

    // Second pass: link children to parents
    organizations.forEach(org => {
      if (org.organizationId && nodes[org.organizationId]) {
        nodes[org.organizationId].children.push(nodes[org.id]);
      } else {
        roots.push(nodes[org.id]);
      }
    });

    return roots;
  }, [organizations]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddChild = (parentId: string) => {
    setParentIdForNew(parentId);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setParentIdForNew(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t(ORGANIZATION_CONSTANTS.CONFIRM_DELETE))) {
      try {
        await organizationRepository.delete(id);
        toast.success(t('common.recordDeleted'));
        fetchOrganizations();
      } catch (error) {
        toast.error("Error deleting organization");
      }
    }
  };

  const renderTree = (nodes: TreeNode[], level: number = 0) => {
    return (
      <ul className={cn("space-y-1", level > 0 && "ml-6 border-l border-border/40 pl-4")}>
        {nodes.map(node => {
          const isExpanded = expandedNodes[node.id];
          const hasChildren = node.children.length > 0;

          return (
            <li key={node.id} className="space-y-1">
              <div className={cn(
                "group flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                selectedNodeId === node.id ? "bg-primary/10 border-primary/20" : "hover:bg-accent/40"
              )}>
                <button
                  onClick={() => toggleNode(node.id)}
                  className={cn(
                    "p-1 hover:bg-accent rounded transition-transform duration-200",
                    !hasChildren && "invisible",
                    isExpanded && "rotate-0"
                  )}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedNodeId(node.id)}>
                  <div className="p-1.5 bg-primary/5 rounded text-primary">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/90">{node.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{node.code}</p>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary hover:bg-primary/10" onClick={() => handleAddChild(node.id)}>
                    <Plus size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:bg-accent" onClick={() => handleEdit(node.id)}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(node.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {isExpanded && hasChildren && renderTree(node.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={PERSON_ROUTES.LIST}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t(ORGANIZATION_CONSTANTS.TREE_TITLE)}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setParentIdForNew(null); setShowForm(true); }} className="gap-2">
            <Plus size={16} /> {t(ORGANIZATION_CONSTANTS.ADD_ROOT)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tree Column */}
        <Card className={cn(
          "border-border/40 bg-card/60 backdrop-blur-sm shadow-xl",
          showForm ? "lg:col-span-7" : "lg:col-span-12"
        )}>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-sm text-muted-foreground font-medium italic">{t(ORGANIZATION_CONSTANTS.LOADING_STRUCTURE)}</p>
              </div>
            ) : treeData.length > 0 ? (
              renderTree(treeData)
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
                <Building2 size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">{t(ORGANIZATION_CONSTANTS.RECORD_NOT_FOUND)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Column */}
        {showForm && (
          <div className="lg:col-span-5 animate-in slide-in-from-right-4 duration-300">
            <Card className="border-border/40 bg-card shadow-2xl sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10">
                <CardTitle className="text-base font-bold">
                  {editingId ? t(ORGANIZATION_CONSTANTS.EDIT_NODE) : t(ORGANIZATION_CONSTANTS.NEW_NODE)}
                </CardTitle>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowForm(false)}>
                  <ChevronRight size={18} />
                </Button>
              </CardHeader>
              <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                {/* Reusing the form page as a component but we need to tweak it for inline use or use a simplified version */}
                {/* For now, I'll pass a custom success callback to close the form and refresh tree */}
                <div className="p-4 scale-[0.95] origin-top">
                  <OrganizationFormPage
                    id={editingId}
                    onSuccess={() => { setShowForm(false); fetchOrganizations(); }}
                    onCancel={() => setShowForm(false)}
                    defaultParentId={parentIdForNew}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
