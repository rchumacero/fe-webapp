"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTranslation } from '@kplian/i18n';
import { CONTACT_CONSTANTS } from '../../constants/contact-constants';
import { CONTACT_ROUTES } from '../../routes/contact-routes';
import { ContactRepositoryImpl } from '../../infrastructure/repositories/ContactRepositoryImpl';
import { Contact } from '../../domain/entities/Contact';
import { CONTACT_DOMAIN_PARAMETERS, P_MEMBER_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Loader2,
  Search
} from 'lucide-react';
import Link from 'next/link';

const contactRepository = new ContactRepositoryImpl();

interface ContactListPageProps {
  personId: string;
}

export const ContactListPage = ({ personId }: ContactListPageProps) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: parametersData } = useDomainParameters({
    parameters: CONTACT_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      getParameterLabel(P_MEMBER_TYPE, contact.type).toLowerCase().includes(search.toLowerCase()) ||
      contact.relationDescription?.toLowerCase().includes(search.toLowerCase())
    );
  }, [contacts, search, getParameterLabel]);

  const fetchContacts = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await contactRepository.getAllByPersonId(personId);
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setShowConfirmDelete(false);
    try {
      await contactRepository.delete(deleteTargetId);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(CONTACT_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchContacts} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={CONTACT_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(CONTACT_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && contacts.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-24" />
            </Card>
          ))
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                    {getParameterLabel(P_MEMBER_TYPE, contact.type)}
                  </p>
                </div>
                <CardTitle className="text-sm font-black text-foreground/90 uppercase">
                  Person Comp: {contact.personCompId}
                </CardTitle>
                <p className="text-xs text-muted-foreground/80 italic">{contact.relationDescription}</p>
              </div>
              <div className="flex gap-2">
                <Link href={CONTACT_ROUTES.EDIT(contact.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredContacts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <Users size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t(CONTACT_CONSTANTS.RECORD_NOT_FOUND)}</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={t(CONTACT_CONSTANTS.CONFIRM_DELETE)}
        description={t(CONTACT_CONSTANTS.FORM.DIRTY_WARNING) || "This action cannot be undone."}
        confirmText={t(CONTACT_CONSTANTS.FORM.SUBMIT)}
        cancelText={t(CONTACT_CONSTANTS.FORM.CANCEL)}
        onConfirm={confirmDelete}
        type="danger"
      />
    </div>
  );
};
