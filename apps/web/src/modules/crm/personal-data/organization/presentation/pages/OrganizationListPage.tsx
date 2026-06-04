"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTranslation } from '@kplian/i18n';
import { ORGANIZATION_CONSTANTS } from '../../constants/organization-constants';
import { ORGANIZATION_ROUTES } from '../../routes/organization-routes';
import { OrganizationRepositoryImpl } from '../../infrastructure/repositories/OrganizationRepositoryImpl';
import { Organization } from '../../domain/entities/Organization';
import { ORGANIZATION_DOMAIN_PARAMETERS, P_ORGANIZATION_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  Building2, 
  Loader2,
  Search,
  MapPin,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const organizationRepository = new OrganizationRepositoryImpl();

interface OrganizationListPageProps {
  personId: string;
}

export const OrganizationListPage = ({ personId }: OrganizationListPageProps) => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: parametersData } = useDomainParameters({
    parameters: ORGANIZATION_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.code.toLowerCase().includes(search.toLowerCase()) ||
      getParameterLabel(P_ORGANIZATION_TYPE, org.type || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [organizations, search, getParameterLabel]);

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

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setShowConfirmDelete(false);
    try {
      await organizationRepository.delete(deleteTargetId);
      toast.success(t('common.recordDeleted') || "Organization deleted successfully");
      fetchOrganizations();
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Error deleting organization");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Building2 size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(ORGANIZATION_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchOrganizations} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={ORGANIZATION_ROUTES.TREE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <LayoutGrid size={18} />
            </Button>
          </Link>
          <Link href={ORGANIZATION_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(ORGANIZATION_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && organizations.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60 h-32" />
          ))
        ) : (
          filteredOrganizations.map((org) => (
            <Card key={org.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                      {org.code}
                    </p>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary/70">
                      {getParameterLabel(P_ORGANIZATION_TYPE, org.type || '')}
                    </p>
                  </div>
                  <CardTitle className="text-sm font-black text-foreground/90 uppercase group-hover:text-primary transition-colors">
                    {org.name}
                  </CardTitle>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={ORGANIZATION_ROUTES.EDIT(org.id, personId)} className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {org.address && (
                <div className="flex items-center gap-1.5 mt-3 text-muted-foreground/70">
                  <MapPin size={12} />
                  <p className="text-[11px] line-clamp-1">{org.address}</p>
                </div>
              )}
            </Card>
          ))
        )}
        {!isLoading && filteredOrganizations.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <Building2 size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t(ORGANIZATION_CONSTANTS.RECORD_NOT_FOUND)}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={t(ORGANIZATION_CONSTANTS.CONFIRM_DELETE)}
        description={t(ORGANIZATION_CONSTANTS.FORM.DIRTY_WARNING) || "This action cannot be undone."}
        confirmText={t(ORGANIZATION_CONSTANTS.FORM.SUBMIT)}
        cancelText={t(ORGANIZATION_CONSTANTS.FORM.CANCEL)}
        onConfirm={confirmDelete}
        type="danger"
      />
    </div>
  );
};
