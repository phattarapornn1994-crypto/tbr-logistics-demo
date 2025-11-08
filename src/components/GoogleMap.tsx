// src/components/GoogleMap.tsx
"use client";

import { useEffect, useRef } from "react";

type GoogleMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
};

declare global {
  interface Window {
    initRouteMap: () => void;
  }
}

export function GoogleMap({ center, zoom = 8 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = document.getElementById("gmaps-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initRouteMap`;
      script.async = true;
      script.defer = true;
      window.initRouteMap = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !(window as any).google?.maps) return;
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: "roadmap",
      });

      new (window as any).google.maps.Marker({
        position: center,
        map,
      });
    }
  }, [center, zoom]);

  return <div ref={mapRef} className="w-full h-80 rounded-xl border" />;
}
