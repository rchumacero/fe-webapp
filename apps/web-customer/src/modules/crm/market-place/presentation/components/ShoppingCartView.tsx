"use client";

import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Star, MapPin, Check } from 'lucide-react';
import { Product } from './SaleDetailView';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBackToShop: () => void;
  onProceedToCheckout?: () => void;
}

export default function ShoppingCartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onBackToShop,
  onProceedToCheckout
}: ShoppingCartViewProps) {
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftItems, setGiftItems] = useState<Record<string, boolean>>({});

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const formattedTotalPrice = totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const toggleGiftItem = (id: string) => {
    setGiftItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sample recently viewed product for the right column section
  const sampleRecentlyViewed: Product = {
    id: 'rv-1',
    name: 'Apple Mac mini Core i3 2018 3.6GHz 16GB RAM 256GB SSD MRTR2LL/A',
    description: 'Mini ordenador ultra compacto con procesador de alto rendimiento.',
    brand: 'Apple',
    price: 405.00,
    image: '/structured_wool_overcoat.jpg'
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">

      {/* Action / Navigation Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-16 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 font-semibold text-black hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg border border-gray-200"
          >
            <ArrowLeft className="size-3.5" />
            Volver a la tienda
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 font-medium">Carrito de compras ({totalQuantity} {totalQuantity === 1 ? 'artículo' : 'artículos'})</span>
        </div>
      </div>

      <main className="flex-1 px-6 lg:px-16 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Cart Items List (8 cols on lg) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-6">
              
              {/* Header */}
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Carrito</h1>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Precio</span>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <ShoppingCart className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Tu carrito de KPLIAN está vacío</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Explora nuestra selección de productos destacados y ofertas para agregar productos a tu carrito.
                  </p>
                  <button
                    onClick={onBackToShop}
                    className="bg-[#FFD814] hover:bg-[#F7CA00] text-black font-semibold text-xs px-6 py-2.5 rounded-full shadow-2xs transition-all inline-block"
                  >
                    Ir a la tienda
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cartItems.map(({ product, quantity }) => {
                    const itemTotal = (product.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    
                    return (
                      <div key={product.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5">
                        {/* Product Image */}
                        <div className="size-28 sm:size-32 bg-[#F8F9FA] rounded-xl border border-gray-100 p-2 flex items-center justify-center flex-shrink-0">
                          <img src={product.image} alt={product.name} className="object-contain max-h-full max-w-full drop-shadow-2xs" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-4">
                              <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
                                {product.brand ? `${product.brand} - ` : ''}{product.name}
                              </h3>
                              <span className="font-extrabold text-base text-gray-900 tracking-tight flex-shrink-0">
                                US${itemTotal}
                              </span>
                            </div>

                            {/* Stock status in red (like Amazon reference) */}
                            <p className="text-xs font-bold text-[#B12704]">
                              Solo queda(n) 15 en stock (hay más unidades en camino).
                            </p>

                            {/* Gift checkbox */}
                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
                              <input
                                type="checkbox"
                                checked={!!giftItems[product.id]}
                                onChange={() => toggleGiftItem(product.id)}
                                className="rounded border-gray-300 text-[#0051FF] focus:ring-0 size-3.5"
                              />
                              <span>Es un regalo</span>
                              <span className="text-[#0066C0] text-[11px] hover:underline cursor-pointer">Más información</span>
                            </label>
                          </div>

                          {/* Controls & Actions Row */}
                          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                            
                            {/* Quantity Pill Control: [- Qty +] */}
                            <div className="flex items-center border border-gray-300 bg-gray-50 rounded-full px-2 py-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                className="size-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-3 font-bold text-xs text-gray-900 min-w-[20px] text-center">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="size-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            <span className="text-gray-300">|</span>

                            {/* Action Links */}
                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="text-[#0066C0] hover:text-[#C45500] hover:underline font-medium"
                            >
                              Eliminar
                            </button>

                            <span className="text-gray-300">|</span>

                            <button className="text-[#0066C0] hover:text-[#C45500] hover:underline font-medium">
                              Guardar para más tarde
                            </button>

                            <span className="text-gray-300 hidden sm:inline">|</span>

                            <button className="text-[#0066C0] hover:text-[#C45500] hover:underline font-medium hidden sm:inline">
                              Comparar con artículos similares
                            </button>

                            <span className="text-gray-300 hidden sm:inline">|</span>

                            <button className="text-[#0066C0] hover:text-[#C45500] hover:underline font-medium hidden sm:inline">
                              Compartir
                            </button>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subtotal Row at bottom right of Cart List */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4 flex justify-end">
                  <p className="text-base text-gray-900">
                    Subtotal ({totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'}):{' '}
                    <span className="font-extrabold text-lg">US${formattedTotalPrice}</span>
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Checkout Box & Recently Viewed (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">

            {/* Subtotal & Proceed to Checkout Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="space-y-1">
                <p className="text-base text-gray-900">
                  Subtotal ({totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'}):{' '}
                  <span className="font-extrabold text-lg block sm:inline">US${formattedTotalPrice}</span>
                </p>
              </div>

              {/* Gift order checkbox */}
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGiftOrder}
                  onChange={(e) => setIsGiftOrder(e.target.checked)}
                  className="rounded border-gray-300 text-[#0051FF] focus:ring-0 size-4"
                />
                <span>Este pedido contiene un regalo</span>
              </label>

              {/* Primary Yellow Checkout Button */}
              <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:bg-gray-200 disabled:text-gray-400 text-black font-semibold text-xs py-3 rounded-full shadow-2xs transition-all active:scale-98"
              >
                Proceder al pago
              </button>
            </div>

            {/* Recently Viewed Products Card ("Productos vistos recientemente") */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Productos vistos recientemente</h3>

              <div className="flex gap-3 items-center">
                <div className="size-20 bg-[#F8F9FA] rounded-lg border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                  <img src={sampleRecentlyViewed.image} alt={sampleRecentlyViewed.name} className="object-contain max-h-full max-w-full" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <a href="#" className="text-xs font-semibold text-[#0066C0] hover:underline line-clamp-2 leading-snug">
                    {sampleRecentlyViewed.name}
                  </a>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-500 font-normal">9</span>
                  </div>

                  {/* Price */}
                  <div className="text-xs font-bold text-gray-900">
                    US${sampleRecentlyViewed.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 space-y-0.5">
                <p>Recíbelo el <span className="font-semibold text-gray-800">lunes, 7 de septiembre</span></p>
                <p>US$58.21 de envío</p>
                <p className="text-[#B12704] font-bold">Solo queda(n) 15 en stock...</p>
              </div>

              <button
                type="button"
                onClick={() => onAddToCart(sampleRecentlyViewed, 1)}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-semibold text-xs py-2 rounded-full shadow-2xs transition-all"
              >
                Agregar al carrito
              </button>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
