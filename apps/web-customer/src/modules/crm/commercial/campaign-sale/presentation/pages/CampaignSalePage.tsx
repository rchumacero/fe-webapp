"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useVendor } from '@/hooks/use-vendor';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CampaignSaleRepositoryImpl, CampaignCategory } from '../../infrastructure/repositories/CampaignSaleRepositoryImpl';
import { CommercialProduct } from '../../../commercial-product/domain/CommercialProduct';
import { formatCurrency } from '@/lib/pdf-helper';
import { RefreshCw, Search, Layers, ShoppingBag, ArrowRight, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const repo = new CampaignSaleRepositoryImpl();

export default function CampaignSalePage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();

  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!vendor) return;
    setLoadingCategories(true);
    try {
      const data = await repo.getActiveCategories(vendor);
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].code);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [vendor, selectedCategory]);

  const fetchProducts = useCallback(async (catCode: string) => {
    if (!vendor) return;
    setLoadingProducts(true);
    try {
      const data = await repo.getCommercialProductsByCategory(catCode, vendor);
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [vendor]);

  useEffect(() => {
    if (vendor) {
      fetchCategories();
    }
  }, [vendor, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory, fetchProducts]);

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.code || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
  });

  const handleCategorySelect = (code: string) => {
    setSelectedCategory(code);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-primary/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit">
            <Sparkles className="size-3" />
            CRM Commercial Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Campaign Sales
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl">
            Select an active campaign category to view premium offerings and commercial products.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchCategories}
            className="rounded-xl border-border/40 bg-card hover:bg-accent gap-2 group transition-all"
          >
            <RefreshCw className={`size-4 group-hover:rotate-180 transition-all duration-700 ${loadingCategories ? 'animate-spin' : ''}`} />
            Refresh Portal
          </Button>
        </div>
      </div>

      {/* Category Selection Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-4 text-primary" /> Active Categories
          </h2>
          {categories.length > 0 && (
            <Badge variant="secondary" className="bg-primary/5 text-primary border border-primary/15 rounded-md">
              {categories.length} Available
            </Badge>
          )}
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-card border border-border/30 animate-pulse flex flex-col justify-between p-4">
                <div className="h-3 w-16 bg-muted rounded-full" />
                <div className="h-4 w-24 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/40 rounded-2xl bg-card/20 backdrop-blur-sm">
            <p className="text-muted-foreground text-sm">No active campaign categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.code;
              return (
                <button
                  key={cat.code}
                  onClick={() => handleCategorySelect(cat.code)}
                  className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 shadow-md ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary shadow-primary/5 scale-[1.02]' 
                      : 'bg-card hover:bg-accent/40 border-border/40 hover:border-primary/30 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex flex-col justify-between h-full gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {cat.code}
                    </span>
                    <span className="text-sm font-bold text-foreground line-clamp-2">
                      {cat.description}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 text-primary animate-in zoom-in-50 duration-300">
                      <CheckCircle2 className="size-4 fill-primary/10" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Presentation List */}
      {selectedCategory && (
        <div className="space-y-6 pt-4 border-t border-border/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="size-5 text-primary" /> Products list
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Showing products belonging to category: <span className="font-bold text-primary">{selectedCategory}</span></p>
            </div>
            
            {/* Search filter */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-card border-border/40 focus:ring-primary/20 transition-all rounded-xl text-sm"
              />
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-card border border-border/30 animate-pulse p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted rounded-full" />
                    <div className="h-4 w-24 bg-muted rounded-full" />
                  </div>
                  <div className="h-6 w-44 bg-muted rounded-full" />
                  <div className="h-12 w-full bg-muted rounded-2xl" />
                  <div className="h-10 w-full bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl bg-card/10">
              <ShoppingBag className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No commercial products available for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <Card
                  key={p.id}
                  className="group relative border-border/40 bg-card hover:bg-accent/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between rounded-3xl overflow-hidden"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex justify-between items-center gap-2">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold rounded-md bg-accent px-2 py-0.5 border-border/30">
                        {p.code}
                      </Badge>
                      <Badge className={`text-[9px] uppercase tracking-wider font-extrabold rounded-full px-2.5 py-0.5 ${
                        p.type === 'COMBO' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {p.type || 'UNIQUE'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6 flex-1">
                    <p className="text-xs text-muted-foreground line-clamp-3 min-h-[48px]">
                      {p.description || 'No description provided for this product.'}
                    </p>
                    <div className="flex justify-between items-center bg-accent/20 rounded-2xl p-4 border border-border/5">
                      <span className="text-xs text-muted-foreground font-medium">Cost / Price</span>
                      <span className="text-lg font-extrabold text-foreground">
                        {p.totalCost !== undefined ? formatCurrency(p.totalCost) : '$ 0,00'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button 
                      className="w-full rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold transition-all shadow-md flex items-center justify-center gap-2 h-11"
                      onClick={() => toast.success(`Selected Product: ${p.name}`)}
                    >
                      Choose Offering
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
