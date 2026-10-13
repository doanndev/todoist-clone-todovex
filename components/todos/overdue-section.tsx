import type { TodoItem } from "@/lib/agenda";
import Todos from "./todos";

/** The "Overdue" block at the top of Today and Upcoming. Hidden when empty. */
export default function OverdueSection({ items }: { items: TodoItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="overdue" className="mb-8">
      <h2 id="overdue" className="mb-1 text-sm font-semibold text-destructive">
        Overdue ({items.length})
      </h2>
      <Todos items={items} />
    </section>
  );
}
