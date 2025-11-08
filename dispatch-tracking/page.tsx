/dispatch-tracking/page.tsx
import { PageHeader } from "@/src/components/PageHeader";
import { GoogleMap } from "@/src/components/GoogleMap";

export default function DispatchTrackingPage() {
  return (
    <>
      <PageHeader
        title="Dispatch & Tracking"
        subtitle="ติดตามยานพาหนะและสถานะจัดส่งแบบ Real-time"
      />
      <GoogleMap center={{ lat: 13.7563, lng: 100.5018 }} zoom={6} />
      {/* ต่อด้วยตารางงาน, สถานะ, ETA ฯลฯ */}
    </>
  );
}
