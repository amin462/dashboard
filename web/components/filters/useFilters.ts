"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filtersFromSearchParams, filtersToQuery, type Filters } from "@/lib/survey/filters";

/** อ่าน/เขียนตัวกรองผ่าน URL query (ซิงก์ทุกหน้า) */
export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const update = useCallback(
    (next: Filters) => {
      const q = filtersToQuery(next);
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return { filters, update, reset };
}
