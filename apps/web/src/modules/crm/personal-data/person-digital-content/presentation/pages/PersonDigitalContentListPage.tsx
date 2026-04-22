"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PERSON_DIGITAL_CONTENT_CONSTANTS } from '../../constants/person-digital-content-constants';
import { PERSON_DIGITAL_CONTENT_ROUTES } from '../../routes/person-digital-content-routes';
import { PersonDigitalContentRepositoryImpl } from '../../infrastructure/repositories/PersonDigitalContentRepositoryImpl';
import { PersonDigitalContent } from '../../domain/entities/PersonDigitalContent';
import { PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS, P_MEDIA_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Loader2,
  FileText,
  Video,
  Search
} from 'lucide-react';
import { bucketService } from '@kplian/core';
import Link from 'next/link';

const personDigitalContentRepository = new PersonDigitalContentRepositoryImpl();

interface PersonDigitalContentListPageProps {
  personId: string;
}

export const PersonDigitalContentListPage = ({ personId }: PersonDigitalContentListPageProps) => {
  const { t } = useTranslation();
  const [contents, setContents] = useState<PersonDigitalContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [images, setImages] = useState<Record<string, string>>({});

  const { data: parametersData } = useDomainParameters({
    parameters: PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredContents = useMemo(() => {
    return contents.filter(content => 
      getParameterLabel(P_MEDIA_TYPE, content.type).toLowerCase().includes(search.toLowerCase()) ||
      content.digitalContentCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [contents, search, getParameterLabel]);

  const fetchContents = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await personDigitalContentRepository.getAllByPersonId(personId);
      setContents(data);

      // Fetch images for all records that represent an image
      const imageMap: Record<string, string> = {};
      const imageRecords = data.filter(content => {
        const tLower = content.type.toLowerCase();
        return !tLower.includes('video') && !tLower.includes('doc') && !tLower.includes('pdf');
      });

      await Promise.all(imageRecords.map(async (content) => {
        if (content.digitalContentCode && content.digitalContentCode !== 'PENDING_UPLOAD') {
          try {
            const presignedData = await bucketService.getPresignedUrl(content.digitalContentCode);
            
            let imageUrl: string | undefined;

            if (Array.isArray(presignedData)) {
              // Old format: Array of objects
              const imageRecord = presignedData.find((r: any) => 
                r.type?.toLowerCase().includes('image') || 
                (r.url || r.URL)?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/)
              );
              imageUrl = imageRecord?.url || imageRecord?.URL;
            } else if (presignedData && typeof presignedData === 'object') {
              // New format suggested by user: Object with URL
              imageUrl = presignedData.url || presignedData.URL;
            } else if (typeof presignedData === 'string' && presignedData.startsWith('http')) {
              // Possible format: Plain string URL
              imageUrl = presignedData;
            }

            if (imageUrl) {
              imageMap[content.digitalContentCode] = imageUrl;
            }
          } catch (e) {
            console.error(`Failed to get presigned URL for ${content.digitalContentCode}`, e);
          }
        }
      }));
      setImages(imageMap);

    } catch (error) {
      console.error("Error fetching contents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete') || "Are you sure?")) return;
    try {
      await personDigitalContentRepository.delete(id);
      fetchContents();
    } catch (error) {
      console.error("Error deleting digital content:", error);
    }
  };

  const getMediaIcon = (type: string) => {
    const tLower = type.toLowerCase();
    if (tLower.includes('video')) return <Video size={18} />;
    if (tLower.includes('doc') || tLower.includes('pdf')) return <FileText size={18} />;
    return <ImageIcon size={18} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(PERSON_DIGITAL_CONTENT_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchContents} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={PERSON_DIGITAL_CONTENT_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(PERSON_DIGITAL_CONTENT_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && contents.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-24" />
            </Card>
          ))
        ) : (
          filteredContents.map((content) => (
            <Card key={content.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 h-14 w-14 rounded-lg overflow-hidden border border-border/20 flex items-center justify-center bg-accent/50 shrink-0">
                  {images[content.digitalContentCode] ? (
                    <img 
                      src={images[content.digitalContentCode]} 
                      alt={content.digitalContentCode}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-primary/70">
                      {getMediaIcon(content.type)}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/60 truncate">
                      {getParameterLabel(P_MEDIA_TYPE, content.type)}
                    </p>
                    {content.priority && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-primary/10 text-primary font-bold">P{content.priority}</span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-black text-foreground/90 truncate max-w-[150px]">
                    {content.digitalContentCode}
                  </CardTitle>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={PERSON_DIGITAL_CONTENT_ROUTES.EDIT(content.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(content.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredContents.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <ImageIcon size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t('common.noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
