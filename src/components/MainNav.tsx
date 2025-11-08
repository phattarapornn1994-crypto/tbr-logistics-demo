// src/components/MainNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Overview" },
  { href: "/route-planning", label: "Route Planning" },
  { href: "/dynamic-routing", label: "Dynamic Routing" },
  { href: "/strategic-routing", label: "Strategic Routing" },
  { href: "/business-operations", label: "Business Ops" },
  { href: "/dispatch-tracking", label: "Dispatch & Tracking" },
  { href: "/database", label: "Database" },
  { href: "/team-equipment", label: "Team & Equipment" },
  { href: "/optimization-settings", label: "Optimization" },
  { href: "/settings", label: "Settings & Security" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-slate-900">
      <div className="max-w-7xl mx-auto flex overflow-x-auto">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-xs md:text-sm whitespace-nowrap transition
                ${active ? "bg-emerald-500 text-white" : "text-slate-200 hover:bg-slate-800"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
