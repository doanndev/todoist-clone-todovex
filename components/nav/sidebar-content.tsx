"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { primaryNavItems } from "@/utils";
import { agendaFor, listItems, projectStats } from "@/lib/agenda";
import { useSwatches } from "@/lib/use-swatches";
import { projectName } from "@/lib/swatch";
import { cn } from "@/lib/utils";
import todovexLogo from "@/public/logo/todovex.svg";
import { Dialog, DialogTrigger } from "../ui/dialog";
import AddProjectDialog from "../projects/add-project-dialog";
import AddLabelDialog from "../labels/add-label-dialog";
import ColorPopover from "../ui/color-popover";
import LabelTag from "../todos/label-tag";
import { useLabelColours } from "@/lib/use-label-colours";
import SwatchStrip from "./swatch-strip";
import UserProfile from "./user-profile";

const railButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-rail-muted transition-colors hover:bg-rail-foreground/[0.06] hover:text-rail-foreground active:scale-95";

export default function SidebarContent() {
  const pathname = usePathname();
  const swatchOf = useSwatches();
  const labelColour = useLabelColours();
  const updateLabelColor = useMutation(api.labels.updateLabelColor);

  const projects = useQuery(api.projects.getProjects);
  const labels = useQuery(api.labels.getLabels);
  const todos = useQuery(api.todos.get);

  const stats = useMemo(() => projectStats(todos ?? []), [todos]);

  const counts: Record<string, number | undefined> = {
    "/loggedin": todos
      ? listItems(todos).filter((t) => !t.isCompleted).length
      : undefined,
    "/loggedin/today": todos
      ? agendaFor(todos).today.filter((t) => !t.isCompleted).length
      : undefined,
  };

  return (
    <div className="rail flex h-full flex-col bg-rail text-rail-foreground">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link
          href="/loggedin"
          className="flex items-center gap-2.5 rounded-md text-lg font-bold tracking-tight"
        >
          <Image alt="" src={todovexLogo} className="h-8 w-8" />
          TodoVex
        </Link>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto pb-6">
        <nav aria-label="Views" className="space-y-0.5 px-3">
          {primaryNavItems.map(({ name, icon, link }) => {
            const active = pathname === link;
            const count = counts[link];
            return (
              <Link
                key={link}
                href={link}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors",
                  active
                    ? "bg-rail-foreground/[0.07] font-semibold text-rail-foreground"
                    : "text-rail-foreground/80 hover:bg-rail-foreground/[0.06] hover:text-rail-foreground",
                )}
              >
                {icon}
                <span className="flex-1">{name}</span>
                {count ? (
                  <span className="text-[13px] tabular-nums">{count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <section aria-labelledby="rail-projects">
          <div className="mb-2 flex items-center justify-between pl-5 pr-3">
            <Link
              id="rail-projects"
              href="/loggedin/projects"
              className="rounded-sm text-[13px] font-semibold text-rail-muted hover:text-rail-foreground"
            >
              Projects
            </Link>
            <AddProjectDialog triggerClassName={railButton} />
          </div>
          <div className="ml-5 flex flex-col gap-1.5">
            {projects === undefined ? (
              <div className="h-14 animate-pulse rounded-l-[3px] bg-rail-foreground/10" />
            ) : (
              projects.map((project) => {
                const stat = stats.get(project._id) ?? { open: 0, total: 0 };
                const href = `/loggedin/projects/${project._id}`;
                return (
                  <SwatchStrip
                    key={project._id}
                    name={projectName(project)}
                    swatch={swatchOf(project._id)}
                    open={stat.open}
                    done={
                      stat.total ? (stat.total - stat.open) / stat.total : 0
                    }
                    href={href}
                    active={pathname === href}
                  />
                );
              })
            )}
          </div>
        </section>

        <section aria-labelledby="rail-labels" className="px-5">
          <div className="mb-2 flex items-center justify-between">
            <h2
              id="rail-labels"
              className="text-[13px] font-semibold text-rail-muted"
            >
              Labels
            </h2>
            <Dialog>
              <DialogTrigger
                className={cn(railButton, "-mr-2")}
                aria-label="Add a label"
              >
                <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </DialogTrigger>
              <AddLabelDialog />
            </Dialog>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-rail-foreground/80">
            {labels?.map((label) => (
              <li key={label._id}>
                <ColorPopover
                  value={labelColour(label._id).name}
                  onPick={(name) =>
                    updateLabelColor({
                      labelId: label._id,
                      color: name,
                    })
                  }
                >
                  <button
                    type="button"
                    aria-label={`${label.name}, change colour`}
                    title="Change colour"
                    className="rounded-[3px] transition-opacity hover:opacity-80 active:scale-95"
                  >
                    <LabelTag label={label} />
                  </button>
                </ColorPopover>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="shrink-0 border-t border-rail-border p-3">
        <UserProfile />
      </div>
    </div>
  );
}
