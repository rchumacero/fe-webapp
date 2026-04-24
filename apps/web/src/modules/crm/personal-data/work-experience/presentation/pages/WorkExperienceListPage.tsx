"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTranslation } from '@kplian/i18n';
import { WORK_EXPERIENCE_CONSTANTS } from '../../constants/work-experience-constants';
import { WORK_EXPERIENCE_ROUTES } from '../../routes/work-experience-routes';
import { WorkExperienceRepositoryImpl } from '../../infrastructure/repositories/WorkExperienceRepositoryImpl';
import { WorkExperience } from '../../domain/entities/WorkExperience';
import { WORK_EXPERIENCE_DOMAIN_PARAMETERS, P_POSITION } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  Briefcase, 
  Loader2,
  Calendar,
  Search
} from 'lucide-react';
import Link from 'next/link';

const workExperienceRepository = new WorkExperienceRepositoryImpl();

interface WorkExperienceListPageProps {
  personId: string;
}

export const WorkExperienceListPage = ({ personId }: WorkExperienceListPageProps) => {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: parametersData } = useDomainParameters({
    parameters: WORK_EXPERIENCE_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => 
      exp.name.toLowerCase().includes(search.toLowerCase()) ||
      getParameterLabel(P_POSITION, exp.positionCode).toLowerCase().includes(search.toLowerCase()) ||
      exp.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [experiences, search, getParameterLabel]);

  const fetchExperiences = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await workExperienceRepository.getAllByPersonId(personId);
      setExperiences(data);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setShowConfirmDelete(false);
    try {
      await workExperienceRepository.delete(deleteTargetId);
      fetchExperiences();
    } catch (error) {
      console.error("Error deleting work experience:", error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Briefcase size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(WORK_EXPERIENCE_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchExperiences} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={WORK_EXPERIENCE_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(WORK_EXPERIENCE_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && experiences.length === 0 ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-32" />
            </Card>
          ))
        ) : (
          filteredExperiences.map((exp) => (
            <Card key={exp.id} className="p-6 border-border/40 bg-card/60 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/60">
                      {getParameterLabel(P_POSITION, exp.positionCode)}
                    </p>
                  </div>
                  <CardTitle className="text-xl font-black text-foreground/90 uppercase">
                    {exp.name}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Link href={WORK_EXPERIENCE_ROUTES.EDIT(exp.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mb-3 bg-accent/30 py-1.5 px-3 rounded-lg w-fit">
                <Calendar size={12} />
                <span>{exp.fromDate}</span>
                <span>—</span>
                <span>{exp.toDate || "Present"}</span>
              </div>
              
              <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                {exp.description}
              </p>
            </Card>
          ))
        )}
        {!isLoading && filteredExperiences.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <Briefcase size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t(WORK_EXPERIENCE_CONSTANTS.RECORD_NOT_FOUND)}</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={t(WORK_EXPERIENCE_CONSTANTS.CONFIRM_DELETE)}
        description={t(WORK_EXPERIENCE_CONSTANTS.FORM.DIRTY_WARNING) || "This action cannot be undone."}
        confirmText={t(WORK_EXPERIENCE_CONSTANTS.FORM.SUBMIT)}
        cancelText={t(WORK_EXPERIENCE_CONSTANTS.FORM.CANCEL)}
        onConfirm={confirmDelete}
        type="danger"
      />
    </div>
  );
};
