export type ChartTableData = {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
};

/** ตารางตัวเลขแบบกะทัดรัด ใช้ทั้งโหมด "ดูเป็นตาราง" ของการ์ดและหน้ารายงาน */
export function DataTable({ data, caption }: { data: ChartTableData; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{data.caption ?? caption}</caption>
        <thead>
          <tr className="bg-surface-2 type-meta text-ink-3">
            {data.headers.map((h, i) => (
              <th key={h} scope="col" className={`px-3 py-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.rows.map((row, r) => (
            <tr key={`${r}-${String(row[0])}`}>
              {row.map((cell, c) => (
                <td key={c} className={`px-3 py-1.5 ${c > 0 ? "text-right text-ink" : "text-ink"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
