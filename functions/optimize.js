export async function onRequestGet(context) {
  // ตัวอย่างข้อมูลรถ (ภายหลังค่อยเปลี่ยนเป็นอ่านจากไฟล์/DB ได้)
  const trucks = [
    {
      id: "OWN_6W",
      type: "OWN",
      maxTon: 8,
      fixedCost: 1200,
      costPerKm: 18
    },
    {
      id: "OWN_10W",
      type: "OWN",
      maxTon: 15,
      fixedCost: 1800,
      costPerKm: 24
    },
    {
      id: "VEN_10W",
      type: "VENDOR",
      maxTon: 15,
      rateType: "per_ton_km",
      rateValue: 1.8,
      minCharge: 4500
    }
  ];

  // สมมติ demand และระยะทาง (เดี๋ยวเวอร์ชันจริงเราจะคำนวณจาก orders.json)
  const demandTon = 12;        // ต้องขน 12 ตัน
  const distanceKm = 300;      // ระยะทางไป-กลับรวม 300 km (เช่น 150 ไป + 150 กลับ)

  const options = [];

  // ตัวเลือก 1: รถบริษัท 10 ล้อ
  {
    const t = trucks.find(tr => tr.id === "OWN_10W");
    const trips = Math.ceil(demandTon / t.maxTon);
    const cost = trips * (t.fixedCost + t.costPerKm * distanceKm);
    options.push({
      mode: "OWN",
      truckId: t.id,
      trips,
      totalCost: cost,
      costPerTon: cost / demandTon
    });
  }

  // ตัวเลือก 2: Outsource 10 ล้อ (คิดตาม ton-km)
  {
    const v = trucks.find(tr => tr.id === "VEN_10W");
    let cost = v.rateValue * demandTon * distanceKm;
    if (cost < v.minCharge) cost = v.minCharge;
    options.push({
      mode: "VENDOR",
      truckId: v.id,
      trips: 1,
      totalCost: cost,
      costPerTon: cost / demandTon
    });
  }

  // เรียงจากต้นทุนต่อ ตัน น้อยไปมาก
  options.sort((a, b) => a.costPerTon - b.costPerTon);

  const best = options[0];

  return new Response(JSON.stringify({
    demandTon,
    distanceKm,
    options,
    best
  }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
