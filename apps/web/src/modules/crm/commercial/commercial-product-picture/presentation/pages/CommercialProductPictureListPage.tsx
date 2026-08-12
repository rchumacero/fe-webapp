"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RefreshCw, Plus, Loader2, Trash2, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { 
  CampaignRepositoryImpl 
} from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { 
  CommercialProductRepositoryImpl 
} from '../../../commercial-product/infrastructure/CommercialProductRepositoryImpl';
import { 
  PictureRepositoryImpl 
} from '@kplian/infrastructure';
import { 
  Campaign, 
  CommercialProduct, 
  Picture,
  bucketService 
} from '@kplian/core';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { COMMERCIAL_PRODUCT_PICTURE_CONSTANTS } from '../../constants/commercial-product-picture-constants';
import { toast } from '@/hooks/use-toast';

const campaignRepo = new CampaignRepositoryImpl();
const productRepo = new CommercialProductRepositoryImpl();
const pictureRepo = new PictureRepositoryImpl();

interface CommercialProductPictureListPageProps {
  commercialProductId: string;
}

export default function CommercialProductPictureListPage({ commercialProductId }: CommercialProductPictureListPageProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [product, setProduct] = useState<CommercialProduct | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formOrder, setFormOrder] = useState('1');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Get Commercial Product
      const prod = await productRepo.getById(commercialProductId);
      setProduct(prod);

      // 2. Get Campaign
      if (prod?.campaignId) {
        const camp = await campaignRepo.getById(prod.campaignId);
        setCampaign(camp);
      }

      // 3. Get all pictures and filter
      const allPictures = await pictureRepo.getAll();
      const productPictures = (allPictures || []).filter(p => p.commercialProductId === commercialProductId);
      setPictures(productPictures);

      // 4. Fetch presigned URLs for pictures
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const idsToFetch = productPictures
        .map(p => p.digitalContentCode)
        .filter((code): code is string => !!code && code !== 'PENDING_UPLOAD' && isUUID(code));

      if (idsToFetch.length > 0) {
        try {
          const batchUrls = await bucketService.getPresignedUrlsBatch(idsToFetch);
          const imageMap: Record<string, string> = {};
          batchUrls.forEach((item: { id: string; presignedUrl: string }) => {
            if (item.presignedUrl) {
              imageMap[item.id] = item.presignedUrl;
            }
          });
          setImages(imageMap);
        } catch (e) {
          console.error("Failed to get presigned URLs", e);
        }
      }
    } catch (error) {
      console.error("Error loading product pictures data:", error);
      toast.error("Failed to load product pictures");
    } finally {
      setIsLoading(false);
    }
  }, [commercialProductId]);

  useEffect(() => {
    if (commercialProductId) {
      loadData();
    }
  }, [commercialProductId, loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const openUploadDialog = () => {
    setSelectedFile(null);
    setFormOrder((pictures.length + 1).toString());
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image file to upload");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create picture database record with placeholder
      const newPic = await pictureRepo.create({
        commercialProductId,
        digitalContentCode: 'PENDING_UPLOAD',
        order: formOrder ? parseInt(formOrder) : 1
      });

      // Step 2: Upload file to bucket
      const uploadResult = await bucketService.uploadFile({
        file: selectedFile,
        moduleCode: COMMERCIAL_PRODUCT_PICTURE_CONSTANTS.MODULE_CODE,
        entityName: COMMERCIAL_PRODUCT_PICTURE_CONSTANTS.ENTITY_NAME,
        entityId: newPic.id,
        bucketName: COMMERCIAL_PRODUCT_PICTURE_CONSTANTS.BUCKET_NAME,
        securityLevelCode: 'PUBLIC'
      });

      // Step 3: Update DB record with real file code
      const fileId = uploadResult?.id || uploadResult?.code || uploadResult?.fileId;
      if (fileId) {
        await pictureRepo.update({
          id: newPic.id,
          commercialProductId,
          digitalContentCode: fileId.toString(),
          order: formOrder ? parseInt(formOrder) : 1
        });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed: No file reference returned");
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error uploading product picture:", error);
      toast.error("Failed to upload product picture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product picture?")) {
      setIsLoading(true);
      try {
        await pictureRepo.delete(id);
        toast.success("Product picture deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting product picture:", error);
        toast.error("Failed to delete product picture");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Breadcrumb 
        items={[
          { label: t('campaigns') || 'Campaigns', href: '/crm/commercial/campaign' },
          { label: campaign?.name || '...', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: product?.name || '...', href: undefined },
          { label: 'Pictures' }
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
            {product?.name ? `${product.name} - Pictures` : 'Product Pictures'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button size="icon" onClick={openUploadDialog} className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      {isLoading && pictures.length === 0 ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : pictures.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No pictures uploaded for this commercial product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pictures.map((pic) => (
            <Card
              key={pic.id}
              className="group border-border/40 bg-card hover:border-primary/30 transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden"
            >
              <div className="aspect-square bg-accent/20 relative flex items-center justify-center border-b border-border/10 overflow-hidden">
                {images[pic.digitalContentCode] ? (
                  <img 
                    src={images[pic.digitalContentCode]} 
                    alt={`Product ${product?.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <ImageIcon size={48} className="text-muted-foreground/30 animate-pulse" />
                )}
              </div>
              <CardContent className="p-3 flex justify-between items-center bg-card">
                <span className="text-xs font-semibold text-muted-foreground">Order: {pic.order ?? 1}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(pic.id)} 
                  className="rounded-full hover:bg-destructive/10 text-destructive h-8 w-8"
                >
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Picture Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Upload Product Picture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>File</Label>
              <div className="border-2 border-dashed border-border/45 rounded-lg p-6 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-card/50 relative">
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="text-muted-foreground/60 h-8 w-8" />
                <span className="text-sm font-medium text-foreground">
                  {selectedFile ? selectedFile.name : 'Select or drag an image file'}
                </span>
                <span className="text-[11px] text-muted-foreground">Supports JPG, PNG, WEBP</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-order">Display Order</Label>
              <Input
                id="form-order"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(e.target.value)}
                placeholder="1"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
