export default function TaskSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b py-4">
          <div className="h-5 w-5 rounded-[3px] bg-muted" />
          <div
            className="h-4 animate-pulse rounded-sm bg-muted"
            style={{ width: `${70 - i * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}
