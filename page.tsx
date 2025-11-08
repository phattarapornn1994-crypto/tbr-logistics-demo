// app/page.tsx
import { PageHeader } from "@/src/components/PageHeader";

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Route Planning System - ระบบจัดแผนการขนส่ง"
        subtitle="วางแผนเส้นทาง • ติดตามแบบ Real-time • พิมพ์เอกสาร • เชื่อมต่อ Geotab / Route4Me / Descartes / Elite EXTRA / Appian"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Route Planning" desc="สร้างและพิมพ์แผนการขนส่ง" href="/route-planning" />
        <SectionCard title="Dynamic Routing" desc="ปรับเส้นทางตามสถานการณ์จริง" href="/dynamic-routing" />
        <SectionCard title="Dispatch & Tracking" desc="ติดตามยานพาหนะและสถานะจัดส่งแบบ Real-time" href="/dispatch-tracking" />
        <SectionCard title="Database" desc="ลูกค้า จุดส่ง ยานพาหนะ เส้นทาง ฐานข้อมูลรวม" href="/database" />
        <SectionCard title="Team & Equipment" desc="ทีมขับรถ อุปกรณ์ และกำลังการขนส่ง" href="/team-equipment" />
        <SectionCard title="Optimization Settings" desc="โปรไฟล์การปรับแต่งและกติกาการวางแผน" href="/optimization-settings" />
      </div>
    </>
  );
}

function SectionCard(props: { title: string; desc: string; href: string }) {
  return (
    <a
      href={props.href}
      className="border rounded-xl p-4 bg-white hover:shadow-md transition flex flex-col gap-2"
    >
      <div className="font-semibold text-emerald-700">{props.title}</div>
      <div className="text-xs text-slate-500">{props.desc}</div>
      <div className="mt-auto text-[10px] text-emerald-600">เปิดโมดูล →</div>
    </a>
  );
}
