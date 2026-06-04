"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { FIELD_CONSTANTS } from '../../constants/field-constants';
import { FIELD_ROUTES } from '../../routes/field-routes';
import { Field } from '../../domain/Field';
import { FieldRepositoryImpl } from '../../infrastructure/FieldRepositoryImpl';
import { FormRepositoryImpl } from '../../../forms/infrastructure/FormRepositoryImpl';
import { Form } from '../../../forms/domain/Form';
import { formatDate } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, MoreHorizontal, Loader2, ArrowLeft, Layers, Sliders, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const fieldRepository = new FieldRepositoryImpl();
const formRepository = new FormRepositoryImpl();

export default function FieldListPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formIdParam = searchParams.get('formId');

  const [selectedFormId, setSelectedFormId] = useState<string>(formIdParam || '');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<Field | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch fields based on selectedFormId
  const fetchFields = useCallback(async () => {
    if (!selectedFormId) {
      setFields([]);
      setSelectedForm(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fieldRepository.getByFormId(selectedFormId);
      // Also fetch the specific form details to display name
      try {
        const formDetails = await formRepository.getById(selectedFormId);
        setSelectedForm(formDetails);
      } catch (err) {
        console.error("Error loading selected form detail:", err);
        setSelectedForm(null);
      }

      // Sort fields by orderField asc
      const sortedData = Array.isArray(data)
        ? [...data].sort((a, b) => (a.orderField || 0) - (b.orderField || 0))
        : [];

      setFields(sortedData);
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFormId]);

  // Load fields when selectedFormId changes
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Update selectedFormId if query param changes
  useEffect(() => {
    setSelectedFormId(formIdParam || '');
  }, [formIdParam]);

  // Client-side search filtering
  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFilteredFields(fields);
      return;
    }

    const filtered = fields.filter(f => {
      const name = (f.name || '').toLowerCase();
      const code = (f.code || '').toLowerCase();
      const config = (f.config || '').toLowerCase();
      return name.includes(term) || code.includes(term) || config.includes(term);
    });

    setFilteredFields(filtered);
  }, [search, fields]);

  const handleRefresh = () => {
    fetchFields();
  };



  const handleDeleteClick = (field: Field) => {
    setDeleteTarget(field);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fieldRepository.delete(deleteTarget.id);
      // Remove from state
      setFields(prev => prev.filter(f => f.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting field:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!selectedFormId) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 border-b border-border/10 mb-2">
          <Link href="/workflow/forms">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t(FIELD_CONSTANTS.LIST_TITLE) || 'Workflow Fields'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage dynamic validation schemas, labels, and rendering orders.
            </p>
          </div>
        </div>

        {/* Fallback visual card */}
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border/40 rounded-xl bg-card/25 text-center my-8">
          <Layers className="h-14 w-14 text-primary/40 mb-4 stroke-[1.5] animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">
            No Form Selected
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
            Fields are linked directly to a specific dynamic form. Please select a form from the Forms page and use the actions menu (three-dots) to manage its fields.
          </p>
          <Link href="/workflow/forms" className="mt-6">
            <Button className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-full px-6 shadow-md transition-all">
              <ClipboardList className="mr-2 h-4 w-4" /> Go to Forms List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-background/85 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/workflow/forms">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedForm
                ? `${t(FIELD_CONSTANTS.LIST_TITLE) || 'Fields'} - ${selectedForm.name}`
                : t(FIELD_CONSTANTS.LIST_TITLE) || 'Workflow Fields'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedForm
                ? `Manage dynamic schema fields for form code: ${selectedForm.code}`
                : 'Manage dynamic validation schemas, labels, and rendering orders.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>

          <Link href={`${FIELD_ROUTES.CREATE()}?formId=${selectedFormId}`}>
            <Button size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-semibold flex items-center gap-1.5 px-4 h-9">
              <Plus size={16} />
              Add Field
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-card/25 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Search Parameters
          </label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search field names, code tags, configuration constraints..."
              className="pl-9 h-10 bg-card/85 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Fields List Representation */}
      {filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <Card
              key={field.id}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1.5 overflow-hidden flex-1 mr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Sliders size={13} className="shrink-0" />
                    <span>{field.code}</span>
                  </div>
                  <CardTitle title={field.name} className="text-base font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                    {field.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="outline" className="text-[9px] py-0 px-2 h-4 bg-primary/5 border-primary/20 text-primary font-bold">
                      Order: #{field.orderField}
                    </Badge>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/80 transition-all outline-none">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={`${FIELD_ROUTES.EDIT(field.id)}?formId=${selectedFormId}`} className="flex items-center w-full">
                        <Edit2 className="mr-2 h-4 w-4" /> {t('common.edit') || 'Edit'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer focus:bg-destructive/10"
                      onClick={() => handleDeleteClick(field)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete') || 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-0 pb-4 flex-1">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Configuration</p>
                  <pre className="text-xs bg-muted/40 p-3 rounded-lg border border-border/20 text-muted-foreground max-h-[100px] overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed select-all">
                    {field.config || 'No JSON configuration provided.'}
                  </pre>
                </div>
              </CardContent>

              <CardFooter className="py-3 border-t border-border/5 flex justify-between items-center bg-muted/10">
                <Badge
                  variant={field.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-[9px] py-0 h-4 uppercase font-semibold"
                >
                  {field.status}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border/40 rounded-xl bg-card/20 text-center animate-in fade-in duration-700">
            <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-foreground">
              {t(FIELD_CONSTANTS.TITLE) || 'Workflow Fields'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {t(FIELD_CONSTANTS.RECORD_NOT_FOUND) || 'No records found'}
            </p>
            <Link href={`${FIELD_ROUTES.CREATE()}?formId=${selectedFormId}`} className="mt-5">
              <Button className="bg-primary hover:bg-primary/95 text-white font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
            </Link>
          </div>
        )
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Field"
        description={`This will permanently delete the validation field "${deleteTarget?.name}" (${deleteTarget?.code}).`}
        confirmText={t('common.confirm') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={confirmDelete}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
