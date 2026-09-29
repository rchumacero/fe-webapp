"use client";

import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Star, MapPin, ChevronDown, ShieldCheck, Check, Info } from 'lucide-react';

export interface ProductMarketVariable {
  orderTask?: number;
  name: string;
  value: string;
}

export interface ProductMarketItem {
  itemCode?: string;
  quantity?: number;
  unitMeasureCode?: string;
}

export interface ProductMarketDetail {
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  productItems?: ProductMarketItem[];
  productVariables?: ProductMarketVariable[];
}

export interface Product {
  id: string;
  name: string;
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
  marketData?: ProductMarketDetail | null;
}

interface SaleDetailViewProps {
  product: Product;
  cartCount?: number;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenCart?: () => void;
}

export default function SaleDetailView({
  product,
  cartCount = 0,
  onBack,
  onAddToCart,
  onOpenCart
}: SaleDetailViewProps) {
  if (!product) {
    return null;
  }

  const [selectedImage, setSelectedImage] = useState(product?.image || '/structured_wool_overcoat.jpg');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Gallery thumbnails fallback using the main product image and variations
  const thumbnails = [
    product.image,
    '/structured_wool_overcoat.jpg',
    '/essential_leather_sneaker.jpg',
    '/cashmere_crewneck.jpg',
    '/everyday_structured_tote.jpg'
  ];

  const wholePrice = Math.floor(product.price).toLocaleString('en-US');
  const centsPrice = ((product.price % 1) * 100).toFixed(0).padStart(2, '0');

  const marketData = product.marketData;
  const displayName = marketData?.name || product.name;
  const displayDescription = marketData?.description || product.description;
  const variables = marketData?.productVariables && marketData.productVariables.length > 0
    ? [...marketData.productVariables].sort((a, b) => (a.orderTask || 0) - (b.orderTask || 0))
    : null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      
      {/* Top Breadcrumb & Back Action Bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 lg:px-16 py-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-black hover:text-gray-700 transition-colors mr-4 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver a la tienda</span>
          </button>
          <span>Market Place</span>
          <span>/</span>
          <span>Computadoras e Informática</span>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-black transition-colors">
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start">

          {/* Left Column: Image Gallery (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col-reverse sm:flex-row gap-4 items-start">
            
            {/* Small Thumbnails strip */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[480px] scrollbar-none w-full sm:w-16 shrink-0">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(thumb)}
                  className={`relative aspect-square w-14 sm:w-full rounded-xl overflow-hidden border p-1 bg-[#F8F9FA] transition-all duration-200 ${
                    selectedImage === thumb 
                      ? 'border-[#0B5CFF] ring-2 ring-[#0B5CFF]/20 shadow-xs scale-102' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>

            {/* Big Main Image Container */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#F8F9FA] border border-gray-100 flex flex-col items-center justify-center p-6 shadow-2xs group">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="bg-white hover:bg-gray-50 text-gray-700 hover:text-black p-2 rounded-full shadow-xs border border-gray-100 transition-all hover:scale-110 active:scale-95"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`size-4.5 transition-colors ${isWishlisted ? 'fill-[#E63946] text-[#E63946]' : 'text-gray-600'}`} />
                </button>
              </div>

              <img
                src={selectedImage}
                alt={displayName}
                className="object-contain w-full h-full max-h-[380px] drop-shadow-sm group-hover:scale-105 transition-transform duration-300 ease-out mix-blend-multiply"
              />

              <span className="text-xs text-gray-400 font-light mt-3">Haz clic para una vista completa</span>
            </div>

          </div>

          {/* Center Column: Product Specs & Information (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col space-y-5">
            
            {/* Title & Brand Link */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug tracking-tight">
                {product.brand ? `${product.brand} - ` : ''}{displayName}
              </h1>
              <a href="#" className="text-xs font-semibold text-[#0066C0] hover:text-[#C45500] hover:underline mt-1.5 inline-block">
                Visita la tienda de {product.brand || 'Amazon Renewed'}
              </a>
            </div>

            {/* Rating Stars & Badge */}
            <div className="flex items-center gap-3 text-xs border-b border-gray-100 pb-4">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span>5.0</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <ChevronDown className="size-3 text-gray-400 ml-0.5" />
                <span className="text-[#0066C0] font-normal hover:underline ml-1">(9 opiniones)</span>
              </div>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                Renewed
              </span>
            </div>

            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1 text-gray-900">
                <span className="text-xs font-semibold self-start mt-1">US$</span>
                <span className="text-3xl font-extrabold tracking-tight">{wholePrice}</span>
                <sup className="text-sm font-bold top-[-0.6em]">{centsPrice}</sup>
              </div>
              <p className="text-xs text-gray-500 font-normal">
                US$174.01 de cargos de envío e importación a Bolivia{' '}
                <span className="text-[#0066C0] cursor-pointer hover:underline">Detalles ∨</span>
              </p>
            </div>

            {/* Tech Specs Summary Table */}
            <div className="border-t border-b border-gray-100 py-4 my-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Especificaciones técnicas</h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {variables ? (
                  variables.map((v, i) => (
                    <React.Fragment key={i}>
                      <span className="font-bold text-gray-900">{v.name}</span>
                      <span className="text-gray-700">{v.value}</span>
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <span className="font-bold text-gray-900">Marca</span>
                    <span className="text-gray-700">{product.brand || 'Apple'}</span>

                    <span className="font-bold text-gray-900">Sistema operativo</span>
                    <span className="text-gray-700">Mac OS X / Windows 11</span>

                    <span className="font-bold text-gray-900">Modelo de CPU</span>
                    <span className="text-gray-700">Core i3 / High Tech</span>

                    <span className="font-bold text-gray-900">Velocidad de la CPU</span>
                    <span className="text-gray-700">3.6 GHz</span>

                    <span className="font-bold text-gray-900">Tamaño de memoria</span>
                    <span className="text-gray-700">16 GB RAM</span>

                    <span className="font-bold text-gray-900">Almacenamiento</span>
                    <span className="text-gray-700">256 GB SSD</span>
                  </>
                )}
              </div>
            </div>

            {/* Bulleted About Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900">Sobre este artículo</h3>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1.5 leading-relaxed">
                <li>Rendimiento potente y eficiente diseñado para multitarea fluida y trabajo exigente.</li>
                <li>Componentes de primera calidad probados e inspeccionados profesionalmente.</li>
                <li>Almacenamiento SSD ultra rápido para tiempos de arranque y respuesta inmediatos.</li>
                <li>Diseño compacto y elegante adaptable a cualquier espacio de trabajo o laboratorio.</li>
                {displayDescription && <li>{displayDescription}</li>}
              </ul>
            </div>

          </div>

          {/* Right Column: Buy Box Card (3 cols on lg) */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-2xl p-5 shadow-xs bg-white space-y-4 sticky top-24">
              
              {/* Product Status */}
              <div>
                <span className="text-xs font-bold text-gray-900">Reacondicionado - Excelente</span>
                <div className="flex items-baseline gap-1 text-gray-900 mt-1">
                  <span className="text-xs font-semibold self-start mt-0.5">US$</span>
                  <span className="text-2xl font-extrabold tracking-tight">{wholePrice}</span>
                  <sup className="text-xs font-bold top-[-0.5em]">{centsPrice}</sup>
                </div>
              </div>

              {/* Shipping & Delivery details */}
              <div className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-800">
                  Entrega por <span className="font-bold text-gray-900">US$58.21</span> el <span className="font-bold text-gray-900">lunes, 7 de septiembre</span>
                </p>
                <div className="flex items-center gap-1.5 text-[#0066C0] font-medium cursor-pointer hover:underline">
                  <MapPin className="size-3.5 text-gray-500" />
                  <span>Enviar a Bolivia</span>
                </div>
              </div>

              {/* In Stock & Seller */}
              <div className="text-xs space-y-1 pt-1">
                <p className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="size-4" /> Disponible
                </p>
                <div className="grid grid-cols-2 text-gray-500 text-[11px] pt-1 gap-y-1">
                  <span>Envía desde</span>
                  <span className="text-gray-900 font-medium">Amazon</span>
                  <span>Vendido por</span>
                  <span className="text-[#0066C0] font-medium hover:underline cursor-pointer">{product.brand || 'TechStore Inc.'}</span>
                  <span>Devoluciones</span>
                  <span className="text-[#0066C0] font-medium hover:underline cursor-pointer">Elegible para devolución</span>
                </div>
              </div>

              {/* Quantity Select */}
              <div className="pt-2">
                <label htmlFor="qty" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Cantidad:
                </label>
                <div className="relative">
                  <select
                    id="qty"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:bg-white cursor-pointer font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    setAddedNotice(true);
                    setTimeout(() => setAddedNotice(false), 3000);
                  }}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-black font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Agregar al carrito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    if (onOpenCart) onOpenCart();
                  }}
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] active:bg-[#E87A00] text-black font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <span>Comprar ahora</span>
                </button>

                {addedNotice && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 text-center font-medium animate-in fade-in slide-in-from-top-1">
                    ✓ Agregado al carrito
                  </div>
                )}
              </div>

              {/* Secure transaction guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="size-3.5 text-gray-600" />
                <span>Transacción segura</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
