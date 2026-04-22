"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar - Persistent left navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Top global actions */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-10 py-2">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
