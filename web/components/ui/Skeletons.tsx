/** Skeleton หน้าแดชบอร์ด: โครงเดียวกับหน้าจริง (คำอธิบาย → KPI การ์ด → กริดกราฟ 12 คอลัมน์) */

const bar = "animate-pulse rounded bg-muted-bar/60";

export function ChartCardSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="card p-5">
      <div className={`h-4 w-48 ${bar}`} />
      <div className={`mt-2 h-3 w-64 max-w-full ${bar}`} />
      <div className={`mt-5 w-full ${bar}`} style={{ height }} />
      <div className={`mt-4 h-3 w-56 ${bar}`} />
    </div>
  );
}

export function StatStripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-4">
          <div className={`h-3 w-20 ${bar}`} />
          <div className={`mt-3 h-8 w-24 ${bar}`} />
          <div className={`mt-3 h-3 w-32 ${bar}`} />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="กำลังโหลดข้อมูล">
      <div className={`h-4 w-80 max-w-full ${bar}`} />
      <StatStripSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartCardSkeleton height={260} />
        </div>
        <div className="lg:col-span-4">
          <ChartCardSkeleton height={260} />
        </div>
      </div>
    </div>
  );
}
