"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Address } from '../../domain/entities/Address';
import { AddressRepositoryImpl } from '../../infrastructure/repositories/AddressRepositoryImpl';
import { ADDRESS_ROUTES } from '../../routes/address-routes';
import { ADDRESS_CONSTANTS } from '../../constants/address-constants';
import Link from 'next/link';

interface AddressListPageProps {
  personId: string;
}

const addressRepository = new AddressRepositoryImpl();

export const AddressListPage = ({ personId }: AddressListPageProps) => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAddresses = async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await addressRepository.getByPersonId(personId);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [personId]);

  const filteredAddresses = useMemo(() => {
    return addresses.filter(addr =>
      (addr.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (addr.description || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [addresses, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(t(ADDRESS_CONSTANTS.DELETE_DESCRIPTION) || "Are you sure you want to delete this record?")) return;
    try {
      await addressRepository.delete(id);
      setAddresses(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <MapPin size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(ADDRESS_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAddresses}
            disabled={isLoading}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={ADDRESS_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search') || 'Search...'}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && addresses.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-32" />
            </Card>
          ))
        ) : (
          filteredAddresses.map((addr) => (
            <Card key={addr.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black">{addr.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{addr.description}</p>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground font-medium">
                  <span>Lat: {addr.latitude}</span>
                  <span>Lon: {addr.longitude}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={ADDRESS_ROUTES.EDIT(addr.id, personId)} className="p-2 hover:bg-accent rounded-md">
                  <Edit2 size={16} />
                </Link>
                <button onClick={() => handleDelete(addr.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredAddresses.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <MapPin size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t(ADDRESS_CONSTANTS.EMPTY_STATE) || 'No addresses found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
