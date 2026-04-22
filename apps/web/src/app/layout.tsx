import type { Metadata } from "next";

export const runtime = 'edge';
import { Outfit } from "next/font/google";
import "./globals.css";
import "@kplian/i18n";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "KRM",
  description: "Advanced CRM based on Clean Architecture",
  icons: {
    icon: "/favicon.ico",
  },
};

import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider delay={0}>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
