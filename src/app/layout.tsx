import "~/app/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { Sidebar } from "~/components/layout/Sidebar";
import { BottomNav } from "~/components/layout/BottomNav";
import { TopBar } from "~/components/layout/TopBar";

export const metadata: Metadata = {
  title: "VSA CRM",
  description: "VSA Acquisition Pipeline CRM",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      </body>
    </html>
  );
}
