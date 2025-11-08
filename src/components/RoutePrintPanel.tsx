// src/components/RoutePrintPanel.tsx
"use client";

export function RoutePrintPanel() {
  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ["Route Name", "Driver", "Vehicle", "Stop Count", "ETA"],
      ["Sample Route", "Somchai", "6W-001", "8", "16:30"],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "routes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3 text-xs">
      <button
        onClick={handlePrint}
        className="px-3 py-1 rounded-md bg-emerald-600 text-white"
      >
        พิมพ์แผนเส้นทาง
      </button>
      <button
        onClick={exportCSV}
        className="px-3 py-1 rounded-md border border-emerald-600 text-emerald-700 bg-white"
      >
        ส่งออก CSV
      </button>
      {/* จุดต่อ: ปุ่ม Export PDF ผ่าน server-side API */}
    </div>
  );
}
