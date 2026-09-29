"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Heart, ShoppingBag, User, ArrowRight, Loader2, ChevronDown, ShoppingCart } from 'lucide-react';
import { createApiClient } from '@kplian/infrastructure';
import { bucketService } from '@kplian/core';
import Image from 'next/image';
import SaleDetailView from '../components/SaleDetailView';
import ShoppingCartView, { CartItem } from '../components/ShoppingCartView';

const apiClient = createApiClient('crm');
const productionApiClient = createApiClient('production');

interface Product {
  id: string;
  name: string;
  productId?: string;
  productCode?: string;
  code?: string;
  configurationCode?: string;
  description?: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  image: string;
  badgeIndex?: number;
  tag?: string;
  marketData?: any;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'AERO X16 - Copilot+ PC - 16" 2560x1600 165Hz',
    description: 'High performance gaming laptop with NVIDIA RTX graphics and AI acceleration.',
    brand: 'GIGABYTE',
    price: 1339.99,
    oldPrice: 1499.99,
    image: '/structured_wool_overcoat.jpg',
    badgeIndex: 1,
    tag: 'Top Deal'
  },
  {
    id: '2',
    name: '32" Odyssey G51F QHD 180Hz 1ms AMD FreeSync Premium',
    description: 'Immersive QHD gaming monitor with ultra-fast 180Hz refresh rate.',
    brand: 'Samsung',
    price: 179.99,
    oldPrice: 329.99,
    image: '/essential_leather_sneaker.jpg',
    badgeIndex: 2,
    tag: 'Top Deal'
  },
  {
    id: '3',
    name: 'Victus 15.6" 144Hz Full HD Gaming Laptop - Intel Core i5',
    description: 'Sleek gaming laptop built for high FPS gameplay and quick multitasking.',
    brand: 'HP',
    price: 749.99,
    oldPrice: 1124.99,
    image: '/cashmere_crewneck.jpg',
    badgeIndex: 3
  },
  {
    id: '4',
    name: 'Everyday Structured Tote Bag',
    description: 'Minimalist leather tote bag designed for everyday essential storage.',
    brand: 'Lo Tuyo',
    price: 295.00,
    image: '/everyday_structured_tote.jpg',
    badgeIndex: 4
  }
];

interface CategoryItem {
  code: string;
  description: string;
}

interface CommercialProductVersionDto {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  total_cost?: number | string;
  totalCost?: number | string;
  cost?: number | string;
  digital_content_code?: string;
  digitalContentCode?: string;
  order?: number;
  vendor_code?: string;
  vendorCode?: string;
  brand?: string;
  product_code?: string;
  productCode?: string;
  configuration_code?: string;
  configurationCode?: string;
  codeConfiguration?: string;
  version?: string;
  product_type_code?: string;
  productTypeCode?: string;
}

export default function MarketPlacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryItem[]>([{ code: 'All', description: 'All' }]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNav, setActiveNav] = useState('Home');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'shop' | 'detail' | 'cart'>('shop');
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);
  const [clickedProductId, setClickedProductId] = useState<string | null>(null);

  // Sync state from URL search params (enables browser Back and Forward buttons)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const productCodeParam = searchParams.get('productCode') || searchParams.get('productId');
    const codeConfigParam = searchParams.get('codeConfiguration');

    if (viewParam === 'cart') {
      setCurrentView('cart');
      setSelectedProduct(null);
    } else if (viewParam === 'detail' && productCodeParam) {
      setCurrentView('detail');
      // If we don't already have this product loaded as selectedProduct
      if (!selectedProduct || (selectedProduct.productCode !== productCodeParam && selectedProduct.code !== productCodeParam && selectedProduct.id !== productCodeParam && selectedProduct.productId !== productCodeParam)) {
        // Try finding it in loaded products or PRODUCTS fallback
        const existing = products.find(p => p.productCode === productCodeParam || p.code === productCodeParam || p.id === productCodeParam || p.productId === productCodeParam) 
          || PRODUCTS.find(p => p.productCode === productCodeParam || p.code === productCodeParam || p.id === productCodeParam || p.productId === productCodeParam);
        
        const baseProd: Product = existing || {
          id: productCodeParam,
          name: 'Product Details',
          productId: productCodeParam,
          productCode: productCodeParam,
          code: productCodeParam,
          configurationCode: codeConfigParam || productCodeParam,
          price: 0,
          image: '/structured_wool_overcoat.jpg'
        };

        const fetchDetail = async () => {
          setLoadingProductDetail(true);
          try {
            const configCode = codeConfigParam || baseProd.configurationCode || baseProd.code || productCodeParam;
            const res = await productionApiClient.get<any>(
              `/v1/product/${productCodeParam}/market`,
              { params: { codeConfiguration: configCode } }
            );
            if (res.data && res.data.product) {
              setSelectedProduct({
                ...baseProd,
                marketData: res.data.product
              });
            } else {
              setSelectedProduct(baseProd);
            }
          } catch (e) {
            console.error("Error fetching market product detail from URL:", e);
            setSelectedProduct(baseProd);
          } finally {
            setLoadingProductDetail(false);
          }
        };

        fetchDetail();
      }
    } else {
      // Default to shop view
      setCurrentView('shop');
      setSelectedProduct(null);
    }
  }, [searchParams, products]);

  const navigateToView = useCallback((view: 'shop' | 'detail' | 'cart', params?: { productCode?: string; productId?: string; codeConfiguration?: string }) => {
    const nextParams = new URLSearchParams();
    if (view === 'cart') {
      nextParams.set('view', 'cart');
    } else if (view === 'detail' && (params?.productCode || params?.productId)) {
      nextParams.set('view', 'detail');
      const pCode = params.productCode || params.productId;
      if (pCode) {
        nextParams.set('productCode', pCode);
      }
      if (params.codeConfiguration) {
        nextParams.set('codeConfiguration', params.codeConfiguration);
      }
    }

    const query = nextParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
  }, [pathname, router]);

  const handleProductClick = async (prod: Product) => {
    setLoadingProductDetail(true);
    setClickedProductId(prod.id);
    const productCode = prod.productCode || prod.code || prod.productId || prod.id;
    const codeConfiguration = prod.configurationCode || prod.code || productCode;

    try {
      const response = await productionApiClient.get<any>(
        `/v1/product/${productCode}/market`,
        { params: { codeConfiguration } }
      );
      if (response.data && response.data.product) {
        setSelectedProduct({
          ...prod,
          marketData: response.data.product
        });
      } else {
        setSelectedProduct(prod);
      }
    } catch (err) {
      console.error("Error fetching market product detail:", err);
      setSelectedProduct(prod);
    } finally {
      setLoadingProductDetail(false);
      setClickedProductId(null);
      navigateToView('detail', { productCode, productId: prod.id, codeConfiguration });
    }
  };

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: {
        id: 'cp-1',
        name: 'Apple Mac mini Core i3 2018 3.6GHz 16GB RAM 256GB SSD MRTR2LL/A',
        description: 'Mini ordenador Mac mini de alta velocidad.',
        brand: 'Apple',
        price: 405.00,
        image: '/structured_wool_overcoat.jpg'
      },
      quantity: 2
    }
  ]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let isCancelled = false;
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<CategoryItem[]>('/v1/campaigns/categories/all');
        if (isCancelled) return;
        if (response.data && Array.isArray(response.data)) {
          const mapped = response.data.map(cat => ({
            code: cat.code,
            description: cat.description || cat.code
          }));
          setCategories([{ code: 'All', description: 'All' }, ...mapped]);
        }
      } catch (err) {
        if (isCancelled) return;
        console.error('Error fetching campaign categories, loading fallbacks:', err);
        setCategories([
          { code: 'All', description: 'All' },
          { code: 'Apparel', description: 'Apparel' },
          { code: 'Accessories', description: 'Accessories' },
          { code: 'Footwear', description: 'Footwear' }
        ]);
      }
    };
    fetchCategories();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'All') {
          params.append('category', activeCategory);
        }
        if (debouncedSearchTerm.trim()) {
          params.append('name', debouncedSearchTerm.trim());
        }

        const queryString = params.toString();
        const url = `/v1/campaigns/commercial-products/versions${queryString ? `?${queryString}` : ''}`;
        const response = await apiClient.get<CommercialProductVersionDto[]>(url);
        
        if (isCancelled) return;

        if (response.data && Array.isArray(response.data)) {
          const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
          const idsToFetch = response.data
            .map((item: CommercialProductVersionDto) => item.digital_content_code || item.digitalContentCode)
            .filter((code): code is string => !!code && isUUID(code));

          const presignedMap: Record<string, string> = {};
          if (idsToFetch.length > 0 && !isCancelled) {
            try {
              const batchUrls = await bucketService.getPresignedUrlsBatch(idsToFetch);
              if (isCancelled) return;
              batchUrls.forEach((item: { id: string; presignedUrl: string }) => {
                if (item.presignedUrl) {
                  presignedMap[item.id] = item.presignedUrl;
                }
              });
            } catch (e) {
              if (isCancelled) return;
              console.error("Failed to fetch product image presigned URLs", e);
            }
          }

          if (isCancelled) return;

          const mapped = response.data.map((item: CommercialProductVersionDto, index: number) => {
            let image = '/everyday_structured_tote.jpg';
            const nameLower = (item.name || '').toLowerCase();
            const digitalCode = item.digital_content_code || item.digitalContentCode;

            if (nameLower.includes('wool') || nameLower.includes('overcoat') || nameLower.includes('aero') || nameLower.includes('laptop')) {
              image = '/structured_wool_overcoat.jpg';
            } else if (nameLower.includes('sneaker') || nameLower.includes('leather') || nameLower.includes('samsung') || nameLower.includes('monitor')) {
              image = '/essential_leather_sneaker.jpg';
            } else if (nameLower.includes('cashmere') || nameLower.includes('crewneck') || nameLower.includes('hp') || nameLower.includes('victus')) {
              image = '/cashmere_crewneck.jpg';
            } else if (nameLower.includes('tote') || nameLower.includes('bag')) {
              image = '/everyday_structured_tote.jpg';
            } else if (digitalCode) {
              image = presignedMap[digitalCode] || `http://local-dev-gateway.kplian.com/bucket/api/v1/files/${digitalCode}`;
            }

            const brand = item.vendor_code || item.vendorCode || item.brand || '';
            const priceVal = item.total_cost ?? item.totalCost ?? item.cost;
            const priceNum = typeof priceVal === 'number' ? priceVal : parseFloat(String(priceVal || '0'));

            const productId = item.id || '';
            const productCode = item.product_code || item.productCode || item.code || '';
            const configurationCode = item.configuration_code || item.configurationCode || item.codeConfiguration || item.version || productCode;

            return {
              id: item.id || productCode || String(Math.random()),
              name: item.name,
              productId: productId,
              productCode: productCode,
              code: productCode,
              configurationCode: configurationCode,
              description: item.description || '',
              brand: brand,
              price: priceNum,
              oldPrice: item.order && item.order % 2 === 0 ? priceNum * 1.15 : undefined,
              image: image,
              badgeIndex: index + 1,
              tag: item.order && item.order % 2 === 0 ? 'Top Deal' : undefined
            };
          });

          if (!isCancelled) {
            setProducts(mapped);
          }
        } else {
          if (!isCancelled) {
            setProducts([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching commercial products versions:', err);
          setProducts(debouncedSearchTerm ? [] : PRODUCTS);
        }
      } finally {
        if (!isCancelled) {
          setLoadingProducts(false);
        }
      }
    };
    fetchProducts();
    return () => {
      isCancelled = true;
    };
  }, [activeCategory, debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">

      {/* 1. Header Navbar (ALWAYS VISIBLE) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 lg:px-16 py-4 flex items-center justify-between">
        {/* Logo and Nav links */}
        <div className="flex items-center gap-12">
          <Image
            src="/lotuyo_logo.svg"
            alt="Lotuyo Logo"
            width={160}
            height={48}
            className="h-12 w-auto object-contain cursor-pointer"
            priority
            onClick={() => {
              setSelectedProduct(null);
              setCurrentView('shop');
            }}
          />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            {['Home', 'New Arrivals', 'Categories', 'Deals'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveNav(item);
                  setSelectedProduct(null);
                  setCurrentView('shop');
                }}
                className={`relative py-1 transition-colors hover:text-black ${activeNav === item && currentView === 'shop' ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black' : ''}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Search, Wishlist, Cart & Profile */}
        <div className="flex items-center gap-6">
          {/* Search Input */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedSearchTerm(searchTerm);
                }
              }}
              className="bg-gray-100/80 pl-4 pr-10 py-2 rounded-lg text-sm w-60 border-none focus:outline-none focus:ring-1 focus:ring-black/10 transition-all text-black"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearchTerm('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Languages */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-gray-700 cursor-pointer">
            <span>🇺🇸 ES</span>
            <ChevronDown className="size-3 text-gray-500" />
          </div>

          {/* Account */}
          <div className="hidden lg:flex flex-col text-xs text-gray-700 cursor-pointer">
            <span className="text-[10px] text-gray-500 font-normal leading-tight">Hola, Identifícate</span>
            <span className="font-semibold leading-tight flex items-center gap-0.5">Cuenta y Listas <ChevronDown className="size-3" /></span>
          </div>

          {/* Orders */}
          <div className="hidden lg:flex flex-col text-xs text-gray-700 cursor-pointer">
            <span className="text-[10px] text-gray-500 font-normal leading-tight">Devoluciones</span>
            <span className="font-semibold leading-tight">y pedidos</span>
          </div>

          {/* Wishlist */}
          <button className="text-gray-700 hover:text-black transition-colors relative">
            <Heart className="size-5" />
          </button>

          {/* Shopping Cart Icon with Badge (Matching attached image 1) */}
          <button
            onClick={() => navigateToView('cart')}
            className="flex items-center gap-1.5 text-gray-800 hover:text-black transition-colors relative group"
            aria-label="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="size-6 text-gray-800 group-hover:text-black" />
              <span className="absolute -top-1.5 font-black text-[11px] text-[#FF6A00]">
                {cartCount}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-900 hidden sm:inline">Carrito</span>
          </button>

          {/* Profile */}
          <button className="text-gray-700 hover:text-black transition-colors">
            <User className="size-5" />
          </button>
        </div>
      </header>

      {/* Dynamic Main Section */}
      {currentView === 'cart' ? (
        <ShoppingCartView
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onAddToCart={handleAddToCart}
          onBackToShop={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              navigateToView('shop');
            }
          }}
        />
      ) : currentView === 'detail' ? (
        selectedProduct ? (
          <SaleDetailView
            product={selectedProduct}
            cartCount={cartCount}
            onAddToCart={handleAddToCart}
            onOpenCart={() => navigateToView('cart')}
            onBack={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                navigateToView('shop');
              }
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#000E3A]" />
            <span className="text-sm font-medium text-gray-500">Cargando detalles del producto...</span>
          </div>
        )
      ) : (

      <main className="flex-1 px-6 lg:px-16 py-6 space-y-10">

        {/* 2. Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setActiveCategory(cat.code)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${activeCategory === cat.code ? 'bg-[#000E3A] text-white shadow-md' : 'bg-[#F2F2F2] text-gray-800 hover:bg-gray-200'}`}
            >
              {cat.description}
            </button>
          ))}
        </div>

        {/* 3. Hero Banner */}
        <section className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl group">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/salar-de-uyuni.jpg"
              alt="Market Place"
              fill
              priority
              className="object-cover group-hover:scale-102 transition-transform duration-1000 ease-out"
            />
            {/* Overlay to ensure maximum text readability */}
            <div className="absolute inset-0 bg-black/35" />
          </div>

          {/* Contents */}
          <div className="relative h-full flex flex-col justify-center items-center text-center px-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-sm leading-tight">
              Market Place
            </h1>
            <p className="text-gray-100 text-sm md:text-base leading-relaxed font-light tracking-wide max-w-xl">
              Explore limited edition items from our favorite artists and designers.
            </p>
            <button className="bg-[#FF6000] text-white hover:bg-[#E05000] font-bold text-xs md:text-sm tracking-wider uppercase px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 duration-200">
              Shop Collection
            </button>
          </div>
        </section>

        {/* 4. Trending Now Products Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F1E36] font-sans">Trending Now</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black transition-colors group">
              View All <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loadingProducts ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#000E3A]" />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium">
              No products found{debouncedSearchTerm ? ` matching "${debouncedSearchTerm}"` : ''} in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 col-span-full">
              {products.map((prod, index) => (
                <div
                  key={`${prod.id}-${index}`}
                  onClick={() => handleProductClick(prod)}
                  className="group cursor-pointer flex flex-col space-y-3"
                >
                  {/* Image Wrapper Card */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F8F9FA] flex items-center justify-center p-3 border border-gray-100/60 shadow-2xs group-hover:shadow-md transition-all duration-300">
                    
                    {/* Loading overlay when product details are being fetched */}
                    {loadingProductDetail && clickedProductId === prod.id && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 transition-opacity">
                        <Loader2 className="h-8 w-8 animate-spin text-[#000E3A]" />
                      </div>
                    )}

                    {/* Index Badge top-left e.g. #1, #2, #3 */}
                    <div className="absolute top-3 left-3 bg-[#0B5CFF] text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs z-10 tracking-tight">
                      #{prod.badgeIndex || index + 1}
                    </div>

                    {/* Wishlist Heart Button top-right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-black p-2 rounded-full shadow-xs backdrop-blur-xs border border-gray-100 transition-all hover:scale-110 active:scale-95 z-10"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="size-4" />
                    </button>

                    {/* Product Image */}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="object-contain w-full h-full drop-shadow-xs group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-col space-y-1 pt-1 px-0.5">
                    {/* Title: brand - name */}
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-black transition-colors line-clamp-2 leading-snug">
                      {prod.brand ? `${prod.brand} - ` : ''}{prod.name}
                    </h3>

                    {/* Description */}
                    {prod.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                        {prod.description}
                      </p>
                    )}

                    {/* Price Section */}
                    <div className="flex flex-col pt-1">
                      {prod.tag && (
                        <span className="text-xs font-bold text-black tracking-tight mb-0.5">{prod.tag}</span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                          ${Math.floor(prod.price).toLocaleString('en-US')}
                          <sup className="text-xs font-bold top-[-0.35em] ml-[1px]">
                            {((prod.price % 1) * 100).toFixed(0).padStart(2, '0')}
                          </sup>
                        </span>
                      </div>
                      {prod.oldPrice && (
                        <span className="text-xs text-gray-400 line-through font-medium mt-0.5">
                          ${prod.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      )}

      {/* 5. Footer */}
      <footer className="bg-[#1A1A1A] text-gray-400 px-6 lg:px-16 py-12 mt-10 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8 mb-8">
          <span className="text-lg font-bold tracking-tight text-white">Lo Tuyo</span>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 text-xs font-semibold tracking-wide">
            {['About Us', 'Contact', 'Shipping Policy', 'Returns', 'Terms of Service'].map((link) => (
              <button key={link} className="hover:text-[#FFFFFF] transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; 2026 KPLIAN Ltda. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
