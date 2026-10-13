"use client";
import { useQuery } from "convex/react";
import { useMemo } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { assignSwatches, GREY, Swatch } from "./swatch";

/** Returns a lookup from project id to its swatch. Safe before data loads. */
export function useSwatches() {
  const projects = useQuery(api.projects.getProjects);
  const map = useMemo(() => assignSwatches(projects ?? []), [projects]);
  return (projectId?: Id<"projects"> | string | null): Swatch =>
    (projectId && map.get(projectId)) || GREY;
}
