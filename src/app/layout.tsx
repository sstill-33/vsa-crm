import "~/app/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { Sidebar } from "~/components/layout/Sidebar";
import { BottomNav } from "~/components/layout/BottomNav";
import { TopBar } from "~/components/layout/TopBar";
import { ServiceWorkerRegistrar } from "~/components/pwa/ServiceWorkerRegistrar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E3554",
};

export const metadata: Metadata = {
  title: "VSA CRM",
  description: "VSA Acquisition Pipeline CRM",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VSA CRM",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar - hidden on mobile */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
                {children}
              </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav />
          </div>
          <Toaster />
        </TRPCReactProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
