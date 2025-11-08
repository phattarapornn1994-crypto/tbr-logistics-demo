// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { MainNav } from "@/src/components/MainNav";

export const metadata = {
  title: "Route Planning System",
  description: "ระบบจัดแผนการขนส่งครบวงจร พร้อมการพิมพ์เอกสารและเชื่อมต่อ Geotab / Route4Me / Descartes / Elite EXTRA / Appian",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="text-xl font-semibold text-emerald-700">
                  Route Planning System
                </div>
                <div className="text-xs text-slate-500">
                  ระบบจัดแผนการขนส่ง • Tracking • Printing • External Integrations
                </div>
              </div>
            </div>
            <MainNav />
          </header>
          <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
