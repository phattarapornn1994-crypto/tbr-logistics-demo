export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  // ====== รับพารามิเตอร์จาก query ======
  const origin = url.searchParams.get("origin");       // รหัสจุดรับ
  const destination = url.searchParams.get("destination"); // รหัสจุดส่ง
  const distanceKm = parseFloat(url.searchParams.get("distanceKm") || "0");
  const weightTon = parseFloat(url.searchParams.get("weightTon") || "0"); // น้ำหนักรวม (ตัน)
  const stops = parseInt(url.searchParams.get("stops") || "1", 10);       // จำนวนจุดส่ง
  const vehicleType = (url.searchParams.get("vehicleType") || "10W").toUpperCase();
  const vendorType = (url.searchParams.get("vendorType") || "OWN").toUpperCase(); // OWN หรือ SUB
  const dateStr = url.searchParams.get("date") || new Date().toISOString().slice(0,10);

  if (!origin || !destination || !distanceKm || !weightTon) {
    return jsonError("missing_params", "ต้องมี origin, destination, distanceKm, weightTon");
  }

  // ====== ตัวอย่างข้อมูลอ้างอิง (v1: hardcode, v2: ค่อยย้ายไป DB) ======

  // OD Cost Matrix: ถ้ามี match จะใช้ rate พิเศษแทนสูตรปกติ
  const odMatrix = [
    {
      origin: "DC_BKK",
      destination: "STORE_A",
      vehicleType: "6W",
      vendorType: "OWN",
      flatTripCost: 3500
    },
    {
      origin: "PLANT_01",
      destination: "YARD_UBON_01",
      vehicleType: "10W",
      vendorType: "SUB",
      flatTripCost: 18000
    }
  ];

  // ฐานค่าเที่ยวตามประเภท (กรณีไม่มี OD พิเศษ)
  const baseRules = [
    {
      vehicleType: "6W",
      vendorType: "OWN",
      basePerKm: 18,
      minCharge: 1500
    },
    {
      vehicleType: "10W",
      vendorType: "OWN",
      basePerKm: 24,
      minCharge: 2000
    },
    {
      vehicleType: "TRAILER",
      vendorType: "OWN",
      basePerKm: 35,
      minCharge: 4000
    },
    {
      vehicleType: "6W",
      vendorType: "SUB",
      rateType: "per_ton_km",
      rateValue: 1.6,
      minCharge: 4000
    },
    {
      vehicleType: "10W",
      vendorType: "SUB",
      rateType: "per_ton_km",
      rateValue: 1.9,
      minCharge: 5000
    },
    {
      vehicleType: "TRAILER",
      vendorType: "SUB",
      rateType: "per_km",
      rateValue: 75,
      minCharge: 9000
    }
  ];

  // Hybrid Rule: N จุดแรก inclusive, เกินคิดรายจุด
  const hybridRule = {
    enabled: true,
    includedStops: 3,
    extraPerStop: 150    // บาท/จุดเกิน
  };

  // Fuel ราคา (ตัวอย่าง): ใช้ช่วงวันที่ใกล้ที่สุด
  const fuelPriceTable = [
    { date: "2025-01-01", pricePerLitre: 32 },
    { date: "2025-06-01", pricePerLitre: 34 },
    { date: "2025-10-01", pricePerLitre: 36 }
  ];

  // Fuel factor สมมติ: ใช้สิ้นเปลืองเฉลี่ย 3 กม./ลิตร
  const defaultKmPerLitre = 3.0;

  // ====== เริ่มคำนวณ ======

  // 1) เช็ค OD matrix ก่อน
  const odMatch = odMatrix.find(o =>
    o.origin === origin &&
    o.destination === destination &&
    o.vehicleType === vehicleType &&
    o.vendorType === vendorType
  );

  let baseFreight = 0;
  let remark = [];

  if (odMatch) {
    baseFreight = odMatch.flatTripCost;
    remark.push("ใช้ราคาเหมา OD Matrix");
  } else {
    // 2) ใช้ rule ทั่วไป
    const rule = baseRules.find(r =>
      r.vehicleType === vehicleType &&
      r.vendorType === vendorType
    );

    if (!rule) {
      return jsonError("no_rule", `ไม่พบ rate สำหรับ ${vehicleType}/${vendorType}`);
    }

    if (rule.rateType === "per_ton_km") {
      baseFreight = rule.rateValue * weightTon * distanceKm;
    } else if (rule.rateType === "per_km") {
      baseFreight = rule.rateValue * distanceKm;
    } else {
      // per km สำหรับ Own
      baseFreight = rule.basePerKm * distanceKm;
    }

    if (rule.minCharge && baseFreight < rule.minCharge) {
      baseFreight = rule.minCharge;
      remark.push("ปรับเป็น Min Charge");
    }
  }

  // 3) Hybrid: คิดค่าเกินจุด
  let extraStopCharge = 0;
  if (hybridRule.enabled && stops > hybridRule.includedStops) {
    const extraStops = stops - hybridRule.includedStops;
    extraStopCharge = extraStops * hybridRule.extraPerStop;
    remark.push(`Hybrid: จุดเกิน ${extraStops} จุด (+${extraStopCharge} บาท)`);
  }

  // 4) Fuel surcharge (ตัวอย่างง่าย: ค่าน้ำมันตามราคาช่วงเวลา + ระยะทาง)
  const fuelPrice = pickFuelPrice(fuelPriceTable, dateStr);
  const fuelLitreUsed = distanceKm / defaultKmPerLitre;
  const fuelCost = fuelLitreUsed * fuelPrice;

  // 5) รวม
  const total = baseFreight + extraStopCharge + fuelCost;

  const result = {
    input: {
      origin,
      destination,
      distanceKm,
      weightTon,
      stops,
      vehicleType,
      vendorType,
      date: dateStr
    },
    breakdown: {
      baseFreight: round(baseFreight),
      extraStopCharge: round(extraStopCharge),
      fuelCost: round(fuelCost),
      total: round(total)
    },
    meta: {
      fuelPrice,
      fuelLitreUsed: round(fuelLitreUsed),
      remark
    }
  };

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

// ===== Helper Functions =====

function jsonError(code, message) {
  return new Response(JSON.stringify({ error: code, message }, null, 2), {
    status: 400,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function pickFuelPrice(table, dateStr) {
  const target = new Date(dateStr);
  let chosen = table[0]?.pricePerLitre || 30;
  table.forEach(row => {
    const d = new Date(row.date);
    if (d <= target) {
      chosen = row.pricePerLitre;
    }
  });
  return chosen;
}

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
