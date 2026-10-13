"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import PageHeader from "../nav/page-header";
import SwatchStrip from "../nav/swatch-strip";
import { useSwatches } from "@/lib/use-swatches";
import { projectName } from "@/lib/swatch";
import { projectStats } from "@/lib/agenda";

export default function ProjectList() {
  const projects = useQuery(api.projects.getProjects);
  const swatchOf = useSwatches();
  const todos = useQuery(api.todos.get);

  const stats = useMemo(() => projectStats(todos ?? []), [todos]);

  return (
    <>
      <PageHeader
        title="Projects"
        meta={projects ? `${projects.length} in the deck` : undefined}
      />
      <div className="flex flex-col gap-2">
        {projects?.map((project) => {
          const stat = stats.get(project._id) ?? { open: 0, total: 0 };
          return (
            <SwatchStrip
              key={project._id}
              name={projectName(project)}
              swatch={swatchOf(project._id)}
              open={stat.open}
              done={stat.total ? (stat.total - stat.open) / stat.total : 0}
              href={`/loggedin/projects/${project._id}`}
              className="h-16 rounded-[3px] text-base"
            />
          );
        })}
      </div>
    </>
  );
}
