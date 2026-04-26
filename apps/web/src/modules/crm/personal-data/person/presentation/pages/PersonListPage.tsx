"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PERSON_CONSTANTS } from '../../constants/person-constants';
import { PERSON_ROUTES } from '../../routes/person-routes';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { PERSON_DOMAIN_PARAMETERS, P_GENDER, P_LOCATION, P_TYPE } from '../../constants/parameter';
import { Person } from '../../domain/entities/Person';
import { PersonRepositoryImpl } from '../../infrastructure/repositories/PersonRepositoryImpl';
import { formatDate, formatDateTime, DEFAULT_PAGE_SIZE, bucketService } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Calendar,
  MapPin,
  MoreHorizontal,
  Loader2,
  UserCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useVendor } from '@/hooks/use-vendor';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const personRepository = new PersonRepositoryImpl();

export default function PersonListPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { vendor } = useVendor();
  const { data: parameters } = useDomainParameters({
    parameters: PERSON_DOMAIN_PARAMETERS
  });
  const [persons, setPersons] = useState<Person[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [profileImages, setProfileImages] = useState<Record<string, string>>({});

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Force re-render on timezone change
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleTzChange = () => setTick(t => t + 1);
    window.addEventListener('timezone-changed', handleTzChange);
    return () => window.removeEventListener('timezone-changed', handleTzChange);
  }, []);

  const isFetching = useRef(false);

  const fetchPersons = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    if (!vendor) {
      setIsLoading(false);
      isFetching.current = false;
      return;
    }

    try {
      const newData = await personRepository.getByVendorId(vendor, {
        page: pageNum,
        pageSize: DEFAULT_PAGE_SIZE,
        filter: search,
      });

      const dataArray = Array.isArray(newData) ? newData : [];

      setPersons(prev => isNewSearch ? dataArray : [...prev, ...dataArray]);
      setHasMore(dataArray.length === DEFAULT_PAGE_SIZE);

      // Batch fetch profile images
      const idsToFetch = dataArray
        .map(p => p.digitalContentCode)
        .filter((code): code is string => !!code && code !== 'PENDING_UPLOAD');

      if (idsToFetch.length > 0) {
        try {
          const batchUrls = await bucketService.getPresignedUrlsBatch(idsToFetch);
          const newImageMap: Record<string, string> = { ...profileImages };
          batchUrls.forEach((item: { id: string; presignedUrl: string }) => {
            newImageMap[item.id] = item.presignedUrl;
          });
          setProfileImages(newImageMap);
        } catch (imageError) {
          console.error("Error fetching batch profile images:", imageError);
        }
      }
    } catch (error) {
      console.error("Error fetching persons:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [search, vendor]); // Add vendor to deps

  useEffect(() => {
    // Only fetch when vendor is available
    if (vendor) {
      fetchPersons(page, page === 1);
    }
  }, [page, fetchPersons, vendor]);

  const handleSearch = () => {
    if (page === 1) {
      fetchPersons(1, true);
    } else {
      setPage(1);
    }
  };

  const handleRefresh = () => {
    if (page === 1) {
      fetchPersons(1, true);
    } else {
      setPage(1);
    }
  };

  const getParameterLabel = (fullCode: string, value: string) => {
    if (!parameters || !parameters[fullCode]) return value;
    const list = parameters[fullCode] || [];
    const item = list.find((p: any) => {
      const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueId;
      return String(val) === String(value);
    });
    if (!item) return value;
    return item.NAME || item.name || item.label || item.description || item.valueStr || value;
  };

  const filteredPersons = persons.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    const cityLabel = getParameterLabel(P_LOCATION, p.cityOrigin).toLowerCase();
    const name = (p.completeName || `${p.name1} ${p.surname1}`).toLowerCase();
    const code = (p.code || '').toLowerCase();

    return name.includes(term) || code.includes(term) || cityLabel.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t(PERSON_CONSTANTS.LIST_TITLE)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={PERSON_ROUTES.CREATE}>
            <Button
              size="icon"
              className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group"
            >
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(PERSON_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersons.map((person, index) => (
          <Card
            key={`${person.id}-${index}`}
            ref={index === persons.length - 1 ? lastElementRef : null}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{person.code}</p>
                <CardTitle title={person.completeName} className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                  {person.completeName}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none group-data-[state=open]:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={PERSON_ROUTES.DETAIL(person.id)} className="flex items-center w-full">
                      <Eye className="mr-2 h-4 w-4" /> {t(PERSON_CONSTANTS.VIEW_DETAIL) || 'Detail'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={PERSON_ROUTES.EDIT(person.id)} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(PERSON_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> {t(PERSON_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4 flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  {person.type !== 'leg' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User size={14} className={person.gender === 'MAL' ? "text-blue-400" : "text-pink-400"} />
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        {getParameterLabel(P_GENDER, person.gender)}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="text-primary/60" />
                    <span>{formatDate(person.birthdate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin size={14} className="text-primary/60" />
                    <span className="truncate">City: {getParameterLabel(P_LOCATION, person.cityOrigin)}</span>
                  </div>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-border/10 shadow-inner group-hover:bg-accent/40 transition-colors overflow-hidden">
                {person.digitalContentCode && profileImages[person.digitalContentCode] ? (
                  <img
                    src={profileImages[person.digitalContentCode]}
                    alt={person.completeName}
                    className="h-full w-full object-cover animate-in fade-in zoom-in duration-300"
                  />
                ) : (
                  <UserCircle size={32} className="text-muted-foreground/30" />
                )}
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center">
                <Badge variant="secondary" className="bg-accent/50 text-[10px] uppercase font-bold px-2 py-0">
                  {getParameterLabel(P_TYPE, person.type)}
                </Badge>
              </div>
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span className="flex items-center gap-1">
                  Created: {formatDateTime(person.createdAt)}
                </span>
                <span className="truncate max-w-[100px]">By: {person.createdBy || 'System'}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && persons.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-8 border-t border-border/5">
          {t(PERSON_CONSTANTS.END_OF_RECORDS) || 'End of records'}
        </p>
      )}
    </div>
  );
}
