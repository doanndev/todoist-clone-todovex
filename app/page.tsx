import Image from "next/image";
import Link from "next/link";

import SwatchStrip from "@/components/nav/swatch-strip";
import ThemeToggle from "@/components/nav/theme-toggle";
import { SWATCHES } from "@/lib/swatch";
import todovexLogo from "@/public/logo/todovex.svg";

// Sample projects for the hero fan. They use the real SwatchStrip component.
const FAN = [
  {
    name: "Passport and visa",
    swatch: SWATCHES[0],
    open: 5,
    done: 0.62,
    offset: "lg:ml-0",
  },
  {
    name: "Studio invoices",
    swatch: SWATCHES[1],
    open: 9,
    done: 0.3,
    offset: "lg:ml-10",
  },
  {
    name: "Garden",
    swatch: SWATCHES[2],
    open: 2,
    done: 0.85,
    offset: "lg:ml-4",
  },
  {
    name: "Q4 planning",
    swatch: SWATCHES[3],
    open: 14,
    done: 0.12,
    offset: "lg:ml-14",
  },
  {
    name: "Flat move",
    swatch: SWATCHES[4],
    open: 7,
    done: 0.48,
    offset: "lg:ml-7",
  },
];

const FACTS = [
  {
    lead: "Projects are colours.",
    text: "Each project gets its own strip, and the bar along its edge fills as you finish tasks.",
  },
  {
    lead: "Today and Upcoming.",
    text: "Overdue work stays on top. Later tasks are grouped by day so you can see what is coming.",
  },
  {
    lead: "Search stays local.",
    text: "It looks through task names and descriptions on your own machine.",
  },
  {
    lead: "Sub-tasks, labels, priority.",
    text: "Break a task down, tag it, and mark how much it matters from lowest to urgent.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-lg font-bold tracking-tight"
        >
          <Image alt="" src={todovexLogo} className="h-9 w-9" priority />
          TodoVex
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/loggedin"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-[15px] font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
          >
            Open TodoVex
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-12">
            <div>
              <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[3.25rem] xl:text-[4.5rem]">
                Your tasks, filed by colour.
              </h1>
              <p className="mt-6 max-w-[34ch] text-xl leading-snug text-muted-foreground">
                A task manager that runs on your own machine. Your tasks stay in
                a local database and it works offline.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="/loggedin"
                  className="inline-flex h-14 items-center rounded-md bg-primary px-8 text-lg font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
                >
                  Open TodoVex
                </Link>
                <a
                  href="#how"
                  className="rounded-sm text-lg font-semibold underline underline-offset-4"
                >
                  See how it files work
                </a>
              </div>
            </div>

            <div
              className="-mr-5 flex flex-col gap-2.5 sm:-mr-8 lg:-mr-[max(2rem,calc((100vw-1280px)/2+2rem))]"
              role="img"
              aria-label="Five project strips in different colours, each with a bar showing how much of the project is done"
            >
              {FAN.map((strip, index) => (
                <SwatchStrip
                  key={strip.name}
                  name={strip.name}
                  swatch={strip.swatch}
                  open={strip.open}
                  done={strip.done}
                  size="lg"
                  animateIn
                  delay={index * 90}
                  className={strip.offset}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-t">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-28">
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
              One deck for everything that is due.
            </h2>
            <ul className="border-t">
              {FACTS.map((fact) => (
                <li key={fact.lead} className="border-b py-6">
                  <p className="text-xl font-semibold">{fact.lead}</p>
                  <p className="mt-1 max-w-[52ch] text-lg text-muted-foreground">
                    {fact.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rail bg-rail text-rail-foreground">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-24">
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
                Runs where you do.
              </h2>
              <p className="mt-5 max-w-[44ch] text-lg text-rail-muted">
                Your tasks live in a local database inside this project. Nothing
                is sent anywhere, and it works without a network.
              </p>
            </div>
            <div className="self-center">
              <pre className="overflow-x-auto rounded-md border border-rail-border bg-card p-6 font-mono text-base leading-relaxed">
                <code>
                  npm install{"\n"}
                  npm run dev
                </code>
              </pre>
              <Link
                href="/loggedin"
                className="mt-6 inline-flex h-12 items-center rounded-md bg-rail-foreground px-6 text-base font-semibold text-rail transition-transform active:scale-[0.98]"
              >
                Open TodoVex
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:px-8">
        <p>MIT licensed. Based on the open source Todovex.</p>
        <a
          href="https://github.com/kulkarniankita/todoist-clone-todovex"
          className="rounded-sm font-semibold text-foreground underline underline-offset-4"
        >
          Original project on GitHub
        </a>
      </footer>
    </div>
  );
}
