import "server-only";
import { cache } from "react";
import { quality } from "@/lib/survey/aggregate";
import { getRawRows } from "@/lib/survey/data";
import { normalize } from "@/lib/survey/normalize";

export const getSurveyBundle = cache(async () => {
  const res = await getRawRows();
  const { rows, all } = normalize(res.rows);
  const q = quality(all);
  return {
    source: res.source,
    error: res.error,
    rows,
    totalAll: all.length,
    lastSubmittedAt: q.lastSubmittedAt,
  };
});
