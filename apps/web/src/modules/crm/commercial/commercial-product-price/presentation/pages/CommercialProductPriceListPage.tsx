"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Plus, Search, Loader2, Trash2, Edit2, MoreHorizontal, ArrowLeft, Coins, Calculator, Layers } from 'lucide-react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { 
  CampaignRepositoryImpl 
} from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { 
  CommercialProductRepositoryImpl 
} from '../../../commercial-product/infrastructure/CommercialProductRepositoryImpl';
import { 
  CommercialProductPriceRepositoryImpl 
} from '@kplian/infrastructure';
import { 
  Campaign, 
  CommercialProduct, 
  CommercialProductPrice 
} from '@kplian/core';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { COMMERCIAL_PRODUCT_PRICE_CONSTANTS } from '../../constants/commercial-product-price-constants';
import { toast } from '@/hooks/use-toast';

const campaignRepo = new CampaignRepositoryImpl();
const productRepo = new CommercialProductRepositoryImpl();
const priceRepo = new CommercialProductPriceRepositoryImpl();

interface CommercialProductPriceListPageProps {
  campaignId: string;
}

export default function CommercialProductPriceListPage({ campaignId }: CommercialProductPriceListPageProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId') || '';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [prices, setPrices] = useState<CommercialProductPrice[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<CommercialProductPrice | null>(null);

  // Form State
  const [formProductId, setFormProductId] = useState('');
  const [formMinQuantity, setFormMinQuantity] = useState('');
  const [formMaxQuantity, setFormMaxQuantity] = useState('');
  const [formSpread, setFormSpread] = useState('');
  const [formRevenueAmount, setFormRevenueAmount] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Get Campaign
      const camp = await campaignRepo.getById(campaignId);
      setCampaign(camp);

      // 2. Get Products for Campaign
      const prodList = await productRepo.getByCampaignId(campaignId);
      setProducts(prodList || []);
      
      const productIds = (prodList || []).map(p => p.id);

      // 3. Get all Prices and filter
      const allPrices = await priceRepo.getAll();
      let campaignPrices = (allPrices || []).filter(p => productIds.includes(p.commercialProductId));
      
      if (commercialProductId) {
        campaignPrices = campaignPrices.filter(p => p.commercialProductId === commercialProductId);
      }
      
      setPrices(campaignPrices);
    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast.error("Failed to load campaign pricing data");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, commercialProductId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const openCreateDialog = () => {
    setSelectedPrice(null);
    setFormProductId(commercialProductId || (products.length > 0 ? products[0].id : ''));
    setFormMinQuantity('');
    setFormMaxQuantity('');
    setFormSpread('');
    setFormRevenueAmount('');
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (price: CommercialProductPrice) => {
    setSelectedPrice(price);
    setFormProductId(price.commercialProductId);
    setFormMinQuantity(price.minQuantity?.toString() || '');
    setFormMaxQuantity(price.maxQuantity?.toString() || '');
    setFormSpread(price.spread?.toString() || '');
    setFormRevenueAmount(price.revenueAmount?.toString() || '');
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId) {
      toast.error("Commercial Product is required");
      return;
    }

    if (formSpread) {
      const val = parseFloat(formSpread);
      if (val < 0 || val > 100) {
        toast.error("Percentage must be between 0 and 100");
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        commercialProductId: formProductId,
        minQuantity: formMinQuantity ? parseFloat(formMinQuantity) : null,
        maxQuantity: formMaxQuantity ? parseFloat(formMaxQuantity) : null,
        spread: formSpread ? parseFloat(formSpread) : null,
        revenueAmount: formRevenueAmount ? parseFloat(formRevenueAmount) : null,
      };

      if (dialogMode === 'create') {
        await priceRepo.create(payload);
        toast.success("Pricing record created successfully");
      } else if (dialogMode === 'edit' && selectedPrice) {
        await priceRepo.update({
          ...payload,
          id: selectedPrice.id
        });
        toast.success("Pricing record updated successfully");
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving pricing record:", error);
      toast.error("Failed to save pricing details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pricing record?")) {
      setIsLoading(true);
      try {
        await priceRepo.delete(id);
        toast.success("Pricing record deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting pricing record:", error);
        toast.error("Failed to delete pricing details");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredPrices = prices.filter(p => {
    const product = products.find(pr => pr.id === p.commercialProductId);
    if (!product) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return product.name.toLowerCase().includes(term) || product.code.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Breadcrumb 
        items={[
          { label: t(COMMERCIAL_PRODUCT_PRICE_CONSTANTS.TITLE) || 'Campaigns', href: '/crm/commercial/campaign' },
          { label: campaign?.name || '...', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: 'Commercial Product Pricing' }
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
            {products.find(p => p.id === commercialProductId) 
              ? `${products.find(p => p.id === commercialProductId)?.name} - Pricing` 
              : 'Commercial Product Pricing'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button size="icon" onClick={openCreateDialog} className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(COMMERCIAL_PRODUCT_PRICE_CONSTANTS.SEARCH_PLACEHOLDER) || 'Filter pricing records by product name...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && prices.length === 0 ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredPrices.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10">
          <p className="text-muted-foreground">No pricing records defined for campaign products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price) => {
            const product = products.find(pr => pr.id === price.commercialProductId);
            return (
              <Card
                key={price.id}
                className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{product?.code}</p>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground flex items-center gap-2">
                      <Layers size={16} className="text-primary/60 shrink-0" />
                      {product?.name || 'Unknown Product'}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
                      <DropdownMenuItem onClick={() => openEditDialog(price)} className="cursor-pointer text-foreground">
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(price.id)} className="text-destructive cursor-pointer focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 pb-4 flex-1">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Calculator size={10} className="text-primary/65" /> Min Qty
                      </p>
                      <p className="font-semibold text-foreground">{price.minQuantity ?? '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Calculator size={10} className="text-primary/65" /> Max Qty
                      </p>
                      <p className="font-semibold text-foreground">{price.maxQuantity ?? '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Coins size={10} className="text-emerald-500/65" /> Spread
                      </p>
                      <p className="font-semibold text-foreground">{price.spread ?? '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Coins size={10} className="text-amber-500/65" /> Revenue
                      </p>
                      <p className="font-semibold text-foreground">
                        {price.revenueAmount ? `$${Number(price.revenueAmount).toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pricing Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create Pricing Record' : 'Edit Pricing Record'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-min-qty">Min Quantity</Label>
                <Input
                  id="form-min-qty"
                  type="number"
                  step="any"
                  value={formMinQuantity}
                  onChange={(e) => setFormMinQuantity(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-max-qty">Max Quantity</Label>
                <Input
                  id="form-max-qty"
                  type="number"
                  step="any"
                  value={formMaxQuantity}
                  onChange={(e) => setFormMaxQuantity(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-rev">Fixed price</Label>
                <Input
                  id="form-rev"
                  type="number"
                  step="any"
                  value={formRevenueAmount}
                  onChange={(e) => {
                    setFormRevenueAmount(e.target.value);
                    if (e.target.value) {
                      setFormSpread('');
                    }
                  }}
                  placeholder="Revenue amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-spread">Or by %</Label>
                <Input
                  id="form-spread"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={formSpread}
                  onChange={(e) => {
                    setFormSpread(e.target.value);
                    if (e.target.value) {
                      setFormRevenueAmount('');
                    }
                  }}
                  placeholder="Spread value"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
