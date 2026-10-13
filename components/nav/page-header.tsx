import { ReactNode } from "react";

export default function PageHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b pb-4">
      <div className="min-w-0">
        <h1 className="truncate text-4xl font-bold leading-none tracking-[-0.03em] md:text-[44px]">
          {title}
        </h1>
        {/* Always rendered, so the header does not jump when the count arrives. */}
        <p className="mt-3 min-h-5 text-sm tabular-nums text-muted-foreground">
          {meta}
        </p>
      </div>
      {actions}
    </div>
  );
}
