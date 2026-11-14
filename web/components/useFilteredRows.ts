"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  applyFilters,
  filtersFromSearchParams,
  hasFilters,
  type Filters,
} from "@/lib/survey/filters";
import type { Row } from "@/lib/survey/schema";

export function useFilteredRows(rows: Row[]): {
  filtered: Row[];
  filters: Filters;
  isFiltered: boolean;
} {
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );

  const filtered = useMemo(
    () => applyFilters(rows, filters),
    [rows, filters]
  );

  const isFiltered = useMemo(() => hasFilters(filters), [filters]);

  return { filtered, filters, isFiltered };
}
