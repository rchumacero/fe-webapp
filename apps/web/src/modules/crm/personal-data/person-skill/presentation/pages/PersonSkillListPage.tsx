"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PERSON_SKILL_CONSTANTS } from '../../constants/person-skill-constants';
import { PERSON_SKILL_ROUTES } from '../../routes/person-skill-routes';
import { PersonSkillRepositoryImpl } from '../../infrastructure/repositories/PersonSkillRepositoryImpl';
import { PersonSkill } from '../../domain/entities/PersonSkill';
import { PERSON_SKILL_DOMAIN_PARAMETERS, P_SKILL } from '../../constants/parameter';
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
  Search
} from 'lucide-react';
import Link from 'next/link';

const personSkillRepository = new PersonSkillRepositoryImpl();

interface PersonSkillListPageProps {
  personId: string;
}

export const PersonSkillListPage = ({ personId }: PersonSkillListPageProps) => {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<PersonSkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState('');

  const { data: parametersData } = useDomainParameters({
    parameters: PERSON_SKILL_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const label = getParameterLabel(P_SKILL, skill.skillCode).toLowerCase();
      return label.includes(search.toLowerCase());
    });
  }, [skills, search, getParameterLabel]);

  const fetchSkills = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await personSkillRepository.getAllByPersonId(personId);
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete') || "Are you sure?")) return;
    try {
      await personSkillRepository.delete(id);
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Briefcase size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(PERSON_SKILL_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchSkills} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={PERSON_SKILL_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(PERSON_SKILL_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && skills.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-20" />
            </Card>
          ))
        ) : (
          filteredSkills.map((skill) => (
            <Card key={skill.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">
                  {t(PERSON_SKILL_CONSTANTS.FORM.SKILL)}
                </p>
                <CardTitle className="text-lg font-black text-foreground/90">
                  {getParameterLabel(P_SKILL, skill.skillCode)}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Link href={PERSON_SKILL_ROUTES.EDIT(skill.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredSkills.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <Briefcase size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t('common.noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
