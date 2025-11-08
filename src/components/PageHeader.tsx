// src/components/PageHeader.tsx
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-lg md:text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && (
        <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
