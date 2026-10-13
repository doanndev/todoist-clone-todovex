"use client";
import { useQuery } from "convex/react";
import { useMemo } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { assignLabelColours, GREY, Swatch } from "./swatch";

/** Returns a lookup from label id to its colour. Safe before data loads. */
export function useLabelColours() {
  const labels = useQuery(api.labels.getLabels);
  const map = useMemo(() => assignLabelColours(labels ?? []), [labels]);
  return (labelId?: Id<"labels"> | string | null): Swatch =>
    (labelId && map.get(labelId)) || GREY;
}
