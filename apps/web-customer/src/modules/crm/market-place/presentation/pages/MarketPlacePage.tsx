"use client";

import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, ArrowRight, Loader2 } from 'lucide-react';
import { createApiClient } from '@kplian/infrastructure';
import Image from 'next/image';

const apiClient = createApiClient('crm');

interface Product {
  id: string;
  name: string;
  color: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: 'NEW' | 'SALE';
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Structured Wool Overcoat',
    color: 'Navy Blue',
    price: 345,
    image: '/structured_wool_overcoat.jpg',
    tag: 'NEW'
  },
  {
    id: '2',
    name: 'Essential Leather Sneaker',
    color: 'Optic White',
    price: 185,
    image: '/essential_leather_sneaker.jpg'
  },
  {
    id: '3',
    name: 'Cashmere Crewneck',
    color: 'Camel',
    price: 145,
    oldPrice: 210,
    image: '/cashmere_crewneck.jpg',
    tag: 'SALE'
  },
  {
    id: '4',
    name: 'Everyday Structured Tote',
    color: 'Matte Black',
    price: 295,
    image: '/everyday_structured_tote.jpg'
  }
];

interface CategoryItem {
  code: string;
  description: string;
}

export default function MarketPlacePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([{ code: 'All', description: 'All' }]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNav, setActiveNav] = useState('Home');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<CategoryItem[]>('/v1/campaigns/categories/all');
        if (response.data && Array.isArray(response.data)) {
          const mapped = response.data.map(cat => ({
            code: cat.code,
            description: cat.description || cat.code
          }));
          setCategories([{ code: 'All', description: 'All' }, ...mapped]);
        }
      } catch (err) {
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
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        let url = '/v1/campaigns/products/launched';
        if (activeCategory !== 'All') {
          url += `?category=${encodeURIComponent(activeCategory)}`;
        }
        const response = await apiClient.get<any[]>(url);
        if (response.data && Array.isArray(response.data)) {
          const mapped = response.data.map((item: any) => {
            let image = '/everyday_structured_tote.jpg';
            const nameLower = (item.name || '').toLowerCase();
            if (nameLower.includes('wool') || nameLower.includes('overcoat')) {
              image = '/structured_wool_overcoat.jpg';
            } else if (nameLower.includes('sneaker') || nameLower.includes('leather')) {
              image = '/essential_leather_sneaker.jpg';
            } else if (nameLower.includes('cashmere') || nameLower.includes('crewneck')) {
              image = '/cashmere_crewneck.jpg';
            } else if (nameLower.includes('tote') || nameLower.includes('bag')) {
              image = '/everyday_structured_tote.jpg';
            } else if (item.digital_content_code) {
              image = `http://local-dev-gateway.kplian.com/bucket/api/v1/files/${item.digital_content_code}`;
            }

            return {
              id: item.id || item.code,
              name: item.name,
              color: item.description || 'Premium Minimalist',
              price: item.total_cost || 0,
              image: image,
              tag: item.order && item.order % 2 === 0 ? 'NEW' : undefined
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching launched products:', err);
        setProducts(PRODUCTS);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      
      {/* 1. Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 lg:px-16 py-4 flex items-center justify-between">
        {/* Logo and Nav links */}
        <div className="flex items-center gap-12">
          <Image
            src="/lotuyo_logo.svg"
            alt="Lotuyo Logo"
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            {['Home', 'New Arrivals', 'Categories', 'Deals'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`relative py-1 transition-colors hover:text-black ${
                  activeNav === item ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black' : ''
                }`}
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
              className="bg-gray-100/80 pl-4 pr-10 py-2 rounded-lg text-sm w-60 border-none focus:outline-none focus:ring-1 focus:ring-black/10 transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          </div>

          {/* Wishlist */}
          <button className="text-gray-700 hover:text-black transition-colors relative">
            <Heart className="size-5" />
          </button>

          {/* Cart Bag */}
          <button className="text-gray-700 hover:text-black transition-colors relative">
            <ShoppingBag className="size-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#FF6A00] text-white text-[9px] font-bold rounded-full size-4.5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <button className="text-gray-700 hover:text-black transition-colors">
            <User className="size-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 lg:px-16 py-6 space-y-10">
        
        {/* 2. Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setActiveCategory(cat.code)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeCategory === cat.code
                  ? 'bg-[#000E3A] text-white shadow-md'
                  : 'bg-[#F2F2F2] text-gray-800 hover:bg-gray-200'
              }`}
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
              src="/fall_collection_banner.jpg"
              alt="The Fall Collection"
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
              The Fall Collection
            </h1>
            <p className="text-gray-100 text-sm md:text-base leading-relaxed font-light tracking-wide max-w-xl">
              Elevate your everyday with our new premium minimalist essentials. Clean lines, superior fabrics, timeless design.
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
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 col-span-full">
              {products.map((prod) => (
                <div key={prod.id} className="group cursor-pointer flex flex-col space-y-3">
                  {/* Image Wrapper */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 shadow-md">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-104 transition-transform duration-550 ease-out"
                    />
                    {prod.tag && (
                      <span className={`absolute top-4 left-4 px-3 py-1 rounded text-[9px] font-bold tracking-wider uppercase text-white shadow-sm ${
                        prod.tag === 'NEW' ? 'bg-[#0051FF]' : 'bg-[#E63946]'
                      }`}>
                        {prod.tag}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">{prod.color}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-base font-bold text-[#000E3A]">
                        ${prod.price}
                      </span>
                      {prod.oldPrice && (
                        <span className="text-xs text-gray-400 line-through font-medium">
                          ${prod.oldPrice}
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

      {/* 5. Footer */}
      <footer className="bg-[#1A1A1A] text-gray-400 px-6 lg:px-16 py-12 mt-10 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8 mb-8">
          <span className="text-lg font-bold tracking-tight text-white">Lo Tuyo</span>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 text-xs font-semibold tracking-wide">
            {['About Us', 'Contact', 'Shipping Policy', 'Returns', 'Terms of Service'].map((link) => (
              <button key={link} className="hover:text-white transition-colors">
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
