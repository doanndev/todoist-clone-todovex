import { ReactNode } from "react";

export default function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b py-10">
      <p className="text-lg font-semibold">{title}</p>
      {children ? (
        <p className="mt-1 max-w-[46ch] text-muted-foreground">{children}</p>
      ) : null}
    </div>
  );
}
