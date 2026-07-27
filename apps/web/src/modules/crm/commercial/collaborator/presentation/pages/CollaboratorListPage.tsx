"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COLLABORATOR_CONSTANTS } from '../../constants/collaborator-constants';
import { COLLABORATOR_ROUTES } from '../../routes/collaborator-routes';
import { Collaborator } from '../../domain/Collaborator';
import { CollaboratorRepositoryImpl } from '../../infrastructure/CollaboratorRepositoryImpl';
import { formatDateTime } from '@kplian/core';
import { CommercialProductRepositoryImpl } from '../../../commercial-product/infrastructure/CommercialProductRepositoryImpl';
import { CampaignRepositoryImpl } from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { COMMERCIAL_PRODUCT_ROUTES } from '../../../commercial-product/routes/commercial-product-routes';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { CommercialProduct } from '@kplian/core';
import { Campaign } from '../../../campaign/domain/entities/Campaign';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Plus, Search, Edit2, Trash2, MoreHorizontal, Loader2, User, DollarSign, Clock, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { SCHEDULE_ROUTES } from '../../../schedule/routes/schedule-routes';
import { SCHEDULE_CONSTANTS } from '../../../schedule/constants/schedule-constants';

import { useVendor } from '@/hooks/use-vendor';
import { PersonRepositoryImpl } from '@/modules/crm/personal-data/person/infrastructure/repositories/PersonRepositoryImpl';
import { Person } from '@/modules/crm/personal-data/person/domain/entities/Person';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { COLLABORATOR_DOMAIN_PARAMETERS, P_STATUS, P_CURRENCY, P_UNIT_MEASURE } from '../../constants/parameter';

const collaboratorRepository = new CollaboratorRepositoryImpl();
const commercialProductRepository = new CommercialProductRepositoryImpl();
const campaignRepository = new CampaignRepositoryImpl();
const personRepository = new PersonRepositoryImpl();

export default function CollaboratorListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId');

  const { vendor } = useVendor();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [commercialProduct, setCommercialProduct] = useState<CommercialProduct | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);

  const { data: parametersData } = useDomainParameters({
    parameters: COLLABORATOR_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const fetchPersons = useCallback(async () => {
    if (!vendor) return;
    setIsLoadingPersons(true);
    try {
      const data = await personRepository.getByVendorId(vendor);
      setPersons(data);
    } catch (error) {
      console.error("Error fetching persons:", error);
    } finally {
      setIsLoadingPersons(false);
    }
  }, [vendor]);

  const fetchCollaborators = useCallback(async () => {
    if (!commercialProductId) return;
    setIsLoading(true);
    try {
      const data = await collaboratorRepository.getByCommercialProductId(commercialProductId);
      setCollaborators(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  }, [commercialProductId]);

  useEffect(() => {
    if (commercialProductId) {
      fetchCollaborators();
      fetchPersons();
      
      const fetchContext = async () => {
        try {
          const product = await commercialProductRepository.getById(commercialProductId);
          setCommercialProduct(product);
          if (product.campaignId) {
            const campaignData = await campaignRepository.getById(product.campaignId);
            setCampaign(campaignData);
          }
        } catch (error) {
          console.error("Error fetching context:", error);
        }
      };
      fetchContext();
    }
  }, [commercialProductId, fetchCollaborators, fetchPersons]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDeleteMessage') || 'Are you sure you want to delete this record?')) return;
    try {
      setIsLoading(true);
      await collaboratorRepository.delete(id);
      toast.success(t('common.recordDeleted') || 'Record deleted successfully');
      fetchCollaborators();
    } catch (error: any) {
      console.error("Error deleting collaborator:", error);
      toast.error(error.message || t('common.errorDeleting') || 'Error deleting record');
    } finally {
      setIsLoading(false);
    }
  };

  const getCollaboratorName = useCallback((employeeId: string) => {
    const person = persons.find(p => p.id === employeeId);
    if (!person) return employeeId;
    return person.completeName || `${person.name1 ?? ''} ${person.surname1 ?? ''}`.trim() || person.code || employeeId;
  }, [persons]);

  const filteredCollaborators = collaborators.filter(collab => {
    const name = getCollaboratorName(collab.employeeId).toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || collab.employeeId.toLowerCase().includes(query);
  });

  if (!commercialProductId) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-bold">Commercial Product ID is missing</p>
        <Button variant="link" onClick={() => router.back()}>{t(COLLABORATOR_CONSTANTS.GO_BACK)}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Breadcrumb 
        items={[
          { label: t('campaigns') || 'Campaigns', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : CAMPAIGN_ROUTES.LIST },
          { label: campaign?.name || '...', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: commercialProduct?.name || '...', href: commercialProduct ? COMMERCIAL_PRODUCT_ROUTES.LIST(commercialProduct.campaignId) : undefined },
          { label: t(COLLABORATOR_CONSTANTS.LIST_TITLE) || 'Collaborators' }
        ]} 
      />

      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(COLLABORATOR_CONSTANTS.LIST_TITLE) || 'Collaborators'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchCollaborators} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={COLLABORATOR_ROUTES.CREATE(commercialProductId)}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(COLLABORATOR_CONSTANTS.SEARCH_PLACEHOLDER) || 'Filter collaborators...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollaborators.map((collab, index) => (
          <Card
            key={`${collab.id}-${index}`}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Collaborator</p>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block flex items-center gap-2">
                  <User size={18} className="text-primary/60" /> {getCollaboratorName(collab.employeeId)}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={COLLABORATOR_ROUTES.EDIT(collab.id, commercialProductId)} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(COLLABORATOR_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  {(commercialProduct?.planScheduleCode === 'YES' || commercialProduct?.planScheduleCode === 'Y') && commercialProduct?.scheduleTypeCode?.toLowerCase() === 'close' && (
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={`${SCHEDULE_ROUTES.LIST('')}&collaboratorId=${collab.id}`} className="flex items-center w-full">
                        <Calendar className="mr-2 h-4 w-4 text-primary" /> {t(SCHEDULE_CONSTANTS.VIEW_SCHEDULE) || 'Schedule'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10" onClick={() => handleDelete(collab.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> {t(COLLABORATOR_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4">
              <div className="flex flex-col gap-y-2 text-sm text-muted-foreground">
                {collab.feeAmount !== undefined && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-primary/60" />
                    <span>Fee: {collab.feeAmount} {getParameterLabel(P_CURRENCY, collab.currencyCode || '')}</span>
                  </div>
                )}
                {collab.appointmentTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary/60" />
                    <span>Time Slot: {collab.appointmentTime} {getParameterLabel(P_UNIT_MEASURE, collab.unitMeasureCode || '')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={collab.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] py-0 h-4">
                    {getParameterLabel(P_STATUS, collab.status || '')}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span>Created: {formatDateTime(collab.createdAt)}</span>
                <span className="truncate max-w-[100px]">By: {collab.createdBy || 'System'}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && filteredCollaborators.length === 0 && (
        <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
          <User size={40} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">{t(COLLABORATOR_CONSTANTS.RECORD_NOT_FOUND) || 'No records found'}</p>
        </div>
      )}
    </div>
  );
}
