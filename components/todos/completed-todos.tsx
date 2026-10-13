import { ReactNode } from "react";

export default function CompletedTodos({
  totalTodos = 0,
  children,
}: {
  totalTodos: number;
  children?: ReactNode;
}) {
  if (totalTodos === 0) return null;

  return (
    <section aria-label="Completed tasks" className="mt-10">
      <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
        Completed <span className="tabular-nums">({totalTodos})</span>
      </h2>
      {children}
    </section>
  );
}
