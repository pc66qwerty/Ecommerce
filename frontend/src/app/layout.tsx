import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

import I18nProvider from "@/components/I18nProvider";
import AuthProvider from "@/components/AuthProvider";
import ToastContainer from "@/components/ToastContainer";
import ErrorBoundary from "@/components/ErrorBoundary";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIAN — Iluminando tu Camino",
  description: "Iluminando tu Camino — Accesorios para auto y luces LED a precios increíbles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ff5000" />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <I18nProvider>
            <ToastContainer />
            <AuthProvider>
              <Navbar />
              <main className="grow pb-16 md:pb-0">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <BottomNav />
            </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
