/route-planning/page.tsx
"use client";

import { PageHeader } from "@/src/components/PageHeader";
import { RoutePrintPanel } from "@/src/components/RoutePrintPanel";
import { GoogleMap } from "@/src/components/GoogleMap";
import { useState } from "react";

type Stop = { id: number; name: string; address: string };

export default function RoutePlanningPage() {
  const [stops, setStops] = useState<Stop[]>([]);

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { id: Date.now(), name: "", address: "" },
    ]);
  };

  return (
    <>
      <PageHeader
        title="Route Planning"
        subtitle="สร้างเส้นทาง • เลือกยานพาหนะ • เลือกคนขับ • พร้อมปุ่มพิมพ์เอกสาร"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-xl bg-white p-3 flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-700">
            ข้อมูลเส้นทาง
          </div>
          <input
            className="border rounded-md px-2 py-1 text-xs"
            placeholder="Route Name / ชื่อเส้นทาง"
          />
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded-md px-2 py-1 text-xs" placeholder="เลือกคนขับ" />
            <input className="border rounded-md px-2 py-1 text-xs" placeholder="ทะเบียนรถ / ประเภทรถ" />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            * รองรับเงื่อนไขจาก Optimization Profiles, เวลาส่ง, ความจุรถ ฯลฯ
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">
              จุดแวะ (Stops)
            </div>
            <button
              onClick={addStop}
              className="px-2 py-1 text-[10px] rounded-md bg-slate-900 text-white"
            >
              + เพิ่มจุด
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {stops.map((s) => (
              <div key={s.id} className="grid grid-cols-2 gap-1">
                <input
                  className="border rounded-md px-2 py-1 text-[10px]"
                  placeholder="ชื่อลูกค้า/จุดส่ง"
                />
                <input
                  className="border rounded-md px-2 py-1 text-[10px]"
                  placeholder="ที่อยู่ / พิกัด"
                />
              </div>
            ))}
          </div>

          <button
            className="mt-3 px-3 py-1 rounded-md bg-emerald-600 text-white text-xs"
          >
            Optimize Route (เรียก API /api/routes/route)
          </button>

          <RoutePrintPanel />
        </div>

        <div className="border rounded-xl bg-white p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            แผนที่เส้นทาง / Real-time View
          </div>
          <GoogleMap center={{ lat: 13.7563, lng: 100.5018 }} zoom={6} />
        </div>
      </div>
    </>
  );
}
