"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Fingerprint,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Identification } from '../../domain/entities/Identification';
import { IdentificationRepositoryImpl } from '../../infrastructure/repositories/IdentificationRepositoryImpl';
import { IDENTIFICATION_ROUTES } from '../../routes/identification-routes';
import { IDENTIFICATION_CONSTANTS } from '../../constants/identification-constants';
import { IDENTIFICATION_DOMAIN_PARAMETERS, P_IDENT_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import Link from 'next/link';
import { formatDate } from '@kplian/core';

interface IdentificationListPageProps {
  personId: string;
}

const identificationRepository = new IdentificationRepositoryImpl();

export const IdentificationListPage = ({ personId }: IdentificationListPageProps) => {
  const { t } = useTranslation();
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: parametersData } = useDomainParameters({
    parameters: IDENTIFICATION_DOMAIN_PARAMETERS
  });

  const getParameterLabel = (domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  };

  const fetchIdentifications = async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await identificationRepository.getByPersonId(personId);
      setIdentifications(data);
    } catch (error) {
      console.error("Error fetching identifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentifications();
  }, [personId]);

  const filteredIdentifications = useMemo(() => {
    return identifications.filter(id =>
      id.type.toLowerCase().includes(search.toLowerCase()) ||
      id.numberIdent.toLowerCase().includes(search.toLowerCase())
    );
  }, [identifications, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete") || "Are you sure you want to delete this record?")) return;
    try {
      await identificationRepository.delete(id);
      setIdentifications(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting identification:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Fingerprint size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(IDENTIFICATION_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchIdentifications}
            disabled={isLoading}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={IDENTIFICATION_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(IDENTIFICATION_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && identifications.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-40" />
            </Card>
          ))
        ) : (
          filteredIdentifications.map((id) => (
            <Card key={id.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-primary">{getParameterLabel(P_IDENT_TYPE, id.type)}</p>
                <h3 className="text-lg font-black">{id.numberIdent}</h3>
              </div>
              <div className="flex gap-2">
                <Link href={IDENTIFICATION_ROUTES.EDIT(id.id, personId)} className="p-2 hover:bg-accent rounded-md">
                  <Edit2 size={16} />
                </Link>
                <button onClick={() => handleDelete(id.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredIdentifications.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground italic">
            {t("common.recordNotFound")}
          </div>
        )}
      </div>
    </div>
  );
};
