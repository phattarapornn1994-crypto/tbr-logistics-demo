export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  // รับค่าจาก query ถ้ามี, ถ้าไม่ส่งมาใช้ค่าทดสอบ
  const demandTon = parseFloat(url.searchParams.get("demandTon") || "12");      // ปริมาณรวม (ตัน)
  const distanceKm = parseFloat(url.searchParams.get("distanceKm") || "300");   // ระยะทางไป-กลับ (km)
  const scenario = (url.searchParams.get("scenario") || "mixed").toLowerCase(); // mixed / own / vendor

  if (!demandTon || !distanceKm || demandTon <= 0 || distanceKm <= 0) {
    return new Response(JSON.stringify({
      error: "invalid_input",
      message: "ต้องระบุ demandTon > 0 และ distanceKm > 0"
    }, null, 2), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // ข้อมูลรถ (ตัวอย่าง - เดี๋ยวเวอร์ชันหน้าเราค่อย sync กับ trucks.json ถ้าต้องการ)
  const trucks = [
    {
      id: "OWN_6W",
      label: "6 ล้อ บริษัท",
      ownerType: "OWN",
      maxWeightKgLegal: 8000,
      fixedCost: 1200,
      costPerKm: 18
    },
    {
      id: "OWN_10W",
      label: "10 ล้อ บริษัท",
      ownerType: "OWN",
      maxWeightKgLegal: 15000,
      fixedCost: 1800,
      costPerKm: 24
    },
    {
      id: "VEN_10W",
      label: "10 ล้อ Outsource",
      ownerType: "VENDOR",
      maxWeightKgLegal: 15000,
      rateType: "per_ton_km",
      rateValue: 1.8,
      minCharge: 4500
    }
  ];

  const options = [];

  // ===== Own Fleet =====
  if (scenario === "mixed" || scenario === "own") {
    const ownList = trucks.filter(t => t.ownerType === "OWN");
    for (const t of ownList) {
      const maxTonPerTrip = t.maxWeightKgLegal / 1000;
      const trips = Math.ceil(demandTon / maxTonPerTrip);
      const cost = trips * (t.fixedCost + t.costPerKm * distanceKm);

      options.push({
        mode: "OWN",
        truckId: t.id,
        truckLabel: t.label,
        trips,
        totalCost: cost,
        costPerTon: cost / demandTon,
        maxTonPerTrip
      });
    }
  }

  // ===== Outsource Vendor =====
  if (scenario === "mixed" || scenario === "vendor") {
    const vendorList = trucks.filter(t => t.ownerType === "VENDOR");
    for (const v of vendorList) {
      const maxTonPerTrip = v.maxWeightKgLegal / 1000;

      // เดโม่: ให้ assume ขนทีเดียวได้ครบถ้า maxTonPerTrip >= demandTon
      // ถ้าไม่พอ จริงๆ ต้องแตกเป็นหลายเที่ยวนะ (ไว้เวอร์ชันหน้า)
      const trips = demandTon > maxTonPerTrip ? Math.ceil(demandTon / maxTonPerTrip) : 1;

      let cost = 0;
      if (v.rateType === "per_ton_km") {
        cost = v.rateValue * demandTon * distanceKm;
      }
      // รองรับแบบ per_km ถ้าจะเพิ่มทีหลัง
      if (v.minCharge && cost < v.minCharge) {
        cost = v.minCharge;
      }

      options.push({
        mode: "VENDOR",
        truckId: v.id,
        truckLabel: v.label,
        trips,
        totalCost: cost,
        costPerTon: cost / demandTon,
        maxTonPerTrip
      });
    }
  }

  if (options.length === 0) {
    return new Response(JSON.stringify({
      error: "no_option",
      message: "ไม่มีตัวเลือกที่ตรงกับ scenario (mixed/own/vendor)"
    }, null, 2), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // เรียงจากต้นทุน/ตันน้อยสุดไปมากสุด
  options.sort((a, b) => a.costPerTon - b.costPerTon);
  const best = options[0];

  return new Response(JSON.stringify({
    input: { demandTon, distanceKm, scenario },
    options,
    best
  }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
