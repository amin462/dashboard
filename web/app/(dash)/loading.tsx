export default function DashLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดข้อมูลแดชบอร์ด">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-surface-muted/80" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-line bg-surface p-5"
          >
            <div className="h-4 w-28 rounded bg-surface-muted" />
            <div className="mt-4 h-8 w-24 rounded bg-surface-muted" />
            <div className="mt-4 h-3 w-36 rounded bg-surface-muted/70" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border border-line bg-surface p-5"
          >
            <div className="h-5 w-48 rounded bg-surface-muted" />
            <div className="mt-4 h-44 rounded-xl bg-surface-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
