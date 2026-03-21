import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/utils";

function getDelayStyle(delay: number): CSSProperties {
  return {
    ["--loading-delay" as string]: `${delay}ms`,
  };
}

function LoadingBlock({
  className,
  delay = 0,
  tone = "light",
}: {
  className?: string;
  delay?: number;
  tone?: "light" | "dark";
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "loading-block",
        tone === "dark" && "loading-block-dark",
        className,
      )}
      style={getDelayStyle(delay)}
    />
  );
}

function LoadingPanel({
  className,
  children,
  delay = 0,
  tone = "light",
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
  tone?: "light" | "dark";
}) {
  return (
    <section
      className={cx(
        "loading-panel",
        tone === "dark" && "loading-panel-dark",
        className,
      )}
      style={getDelayStyle(delay)}
    >
      {children}
    </section>
  );
}

function LoadingMetricCard({ index }: { index: number }) {
  const delay = index * 110;

  return (
    <LoadingPanel className="px-4 py-4 sm:px-5 sm:py-5" delay={delay}>
      <LoadingBlock className="h-2 w-16" delay={delay + 40} />
      <div className="mt-4 flex items-end justify-between gap-4">
        <LoadingBlock className="h-10 w-24" delay={delay + 90} />
        <LoadingBlock className="h-10 w-10" delay={delay + 120} />
      </div>
      <div className="mt-4 space-y-2">
        <LoadingBlock className="h-3 w-full" delay={delay + 140} />
        <LoadingBlock className="h-3 w-4/5" delay={delay + 180} />
      </div>
    </LoadingPanel>
  );
}

function LoadingResultRow({ index }: { index: number }) {
  const delay = index * 120;

  return (
    <article className="border-b border-[rgba(15,42,68,0.08)] px-5 py-5 last:border-b-0 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-2">
          <LoadingBlock className="h-2 w-52" delay={delay + 30} />
          <LoadingBlock className="h-8 w-full max-w-3xl" delay={delay + 70} />
          <LoadingBlock className="h-3 w-2/3" delay={delay + 110} />
          <div className="space-y-2 pt-1">
            <LoadingBlock className="h-3 w-full" delay={delay + 140} />
            <LoadingBlock className="h-3 w-11/12" delay={delay + 170} />
            <LoadingBlock className="h-3 w-4/5" delay={delay + 200} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <LoadingBlock className="h-7 w-28" delay={delay + 220} />
            <LoadingBlock className="h-7 w-24" delay={delay + 250} />
            <LoadingBlock className="h-7 w-20" delay={delay + 280} />
          </div>
        </div>

        <div className="hidden justify-self-end lg:block">
          <div className="w-[160px] space-y-2 text-right">
            <LoadingBlock className="ml-auto h-3 w-20" delay={delay + 100} />
            <LoadingBlock className="ml-auto h-6 w-36" delay={delay + 150} />
            <LoadingBlock className="ml-auto h-3 w-28" delay={delay + 190} />
          </div>
        </div>
      </div>
    </article>
  );
}

function AppPageLoadingBody() {
  return (
    <div className="page-shell space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <LoadingBlock className="h-2 w-20" delay={20} />
        <LoadingBlock className="h-12 w-full max-w-3xl" delay={70} />
        <LoadingBlock className="h-4 w-full max-w-2xl" delay={120} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingMetricCard key={index} index={index} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_360px]">
        <LoadingPanel className="overflow-hidden">
          <div className="border-b border-[rgba(15,42,68,0.08)] px-5 py-4 sm:px-6">
            <LoadingBlock className="h-2 w-24" delay={90} />
            <LoadingBlock className="mt-3 h-8 w-full max-w-xl" delay={130} />
            <LoadingBlock className="mt-2 h-3 w-full max-w-lg" delay={170} />
          </div>
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingResultRow key={index} index={index} />
            ))}
          </div>
        </LoadingPanel>

        <div className="space-y-5">
          <LoadingPanel className="px-5 py-5 sm:px-6">
            <LoadingBlock className="h-2 w-20" delay={80} />
            <LoadingBlock className="mt-4 h-7 w-full max-w-[220px]" delay={120} />
            <div className="mt-4 space-y-3">
              <LoadingBlock className="h-10 w-full" delay={150} />
              <LoadingBlock className="h-10 w-full" delay={180} />
              <LoadingBlock className="h-10 w-full" delay={210} />
            </div>
          </LoadingPanel>

          <LoadingPanel className="px-5 py-5 sm:px-6">
            <LoadingBlock className="h-2 w-16" delay={120} />
            <LoadingBlock className="mt-4 h-3 w-full" delay={160} />
            <LoadingBlock className="mt-2 h-3 w-5/6" delay={200} />
            <div className="mt-5 grid gap-3">
              <LoadingBlock className="h-20 w-full" delay={220} />
              <LoadingBlock className="h-20 w-full" delay={260} />
            </div>
          </LoadingPanel>
        </div>
      </section>
    </div>
  );
}

export function RootLoadingScreen() {
  return (
    <main className="archive-grid flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
      <LoadingPanel className="w-full max-w-4xl px-8 py-10 text-center sm:px-12 sm:py-12" delay={40}>
        <div className="space-y-5">
          <div className="flex justify-center">
            <LoadingBlock className="h-2 w-28" delay={90} />
          </div>
          <div className="space-y-3">
            <LoadingBlock className="mx-auto h-14 w-full max-w-3xl" delay={130} />
            <LoadingBlock className="mx-auto h-4 w-full max-w-xl" delay={170} />
            <LoadingBlock className="mx-auto h-4 w-full max-w-lg" delay={210} />
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <LoadingBlock className="h-10 w-40" delay={250} />
            <LoadingBlock className="h-10 w-28" delay={290} />
          </div>
        </div>
      </LoadingPanel>
    </main>
  );
}

export function PublicPageLoadingScreen() {
  return (
    <main className="archive-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1480px] gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="dark-rail px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
          <div className="space-y-6">
            <LoadingPanel tone="dark" className="px-5 py-5" delay={30}>
              <LoadingBlock className="h-2 w-28" delay={70} tone="dark" />
              <LoadingBlock className="mt-4 h-16 w-full" delay={110} tone="dark" />
              <LoadingBlock className="mt-4 h-4 w-full max-w-xl" delay={150} tone="dark" />
              <LoadingBlock className="mt-2 h-4 w-5/6" delay={190} tone="dark" />
            </LoadingPanel>

            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <LoadingPanel
                  key={index}
                  tone="dark"
                  className="px-4 py-5"
                  delay={index * 120 + 90}
                >
                  <LoadingBlock className="h-2 w-20" delay={index * 120 + 120} tone="dark" />
                  <LoadingBlock className="mt-4 h-12 w-full" delay={index * 120 + 160} tone="dark" />
                  <LoadingBlock className="mt-3 h-3 w-4/5" delay={index * 120 + 200} tone="dark" />
                </LoadingPanel>
              ))}
            </div>

            <LoadingPanel tone="dark" className="px-5 py-5" delay={210}>
              <LoadingBlock className="h-2 w-24" delay={250} tone="dark" />
              <LoadingBlock className="mt-4 h-12 w-full" delay={290} tone="dark" />
              <LoadingBlock className="mt-3 h-3 w-full" delay={330} tone="dark" />
              <LoadingBlock className="mt-2 h-3 w-2/3" delay={360} tone="dark" />
            </LoadingPanel>
          </div>
        </section>

        <section className="flex items-center">
          <LoadingPanel className="w-full px-6 py-8 sm:px-8 lg:px-10 lg:py-10" delay={90}>
            <div className="space-y-6">
              <div className="space-y-3">
                <LoadingBlock className="h-2 w-24" delay={130} />
                <LoadingBlock className="h-11 w-full max-w-md" delay={170} />
                <LoadingBlock className="h-4 w-full" delay={210} />
                <LoadingBlock className="h-4 w-5/6" delay={250} />
              </div>

              <div className="grid gap-4">
                <LoadingBlock className="h-12 w-full" delay={290} />
                <LoadingBlock className="h-12 w-full" delay={330} />
                <LoadingBlock className="h-12 w-full" delay={370} />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <LoadingBlock className="h-10 w-full max-w-sm" delay={410} />
                <LoadingBlock className="h-12 w-44" delay={450} />
              </div>
            </div>
          </LoadingPanel>
        </section>
      </div>
    </main>
  );
}

export function AppRouteLoadingScreen() {
  return <AppPageLoadingBody />;
}

export function AppShellLoadingScreen() {
  return (
    <div className="archive-grid relative h-screen overflow-hidden" aria-busy="true">
      <div className="relative h-full lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="dark-rail flex h-full flex-col px-4 pb-6 pt-5 text-white">
            <LoadingPanel tone="dark" className="px-4 py-5" delay={40}>
              <LoadingBlock className="h-2 w-24" delay={80} tone="dark" />
              <LoadingBlock className="mt-4 h-10 w-36" delay={120} tone="dark" />
              <LoadingBlock className="mt-4 h-16 w-full" delay={160} tone="dark" />
            </LoadingPanel>

            <div className="flex-1 px-2 pt-6">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, sectionIndex) => (
                  <LoadingPanel
                    key={sectionIndex}
                    tone="dark"
                    className="px-4 py-4"
                    delay={sectionIndex * 110 + 80}
                  >
                    <LoadingBlock
                      className="h-2 w-16"
                      delay={sectionIndex * 110 + 110}
                      tone="dark"
                    />
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: 2 }).map((__, itemIndex) => (
                        <LoadingBlock
                          key={itemIndex}
                          className="h-10 w-full"
                          delay={sectionIndex * 110 + itemIndex * 40 + 150}
                          tone="dark"
                        />
                      ))}
                    </div>
                  </LoadingPanel>
                ))}
              </div>
            </div>

            <LoadingPanel tone="dark" className="mt-4 px-4 py-4" delay={190}>
              <LoadingBlock className="h-10 w-full" delay={230} tone="dark" />
              <LoadingBlock className="mt-4 h-14 w-full" delay={270} tone="dark" />
              <LoadingBlock className="mt-4 h-10 w-full" delay={310} tone="dark" />
            </LoadingPanel>
          </div>
        </aside>

        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-[color:var(--color-background)]">
          <div className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
            <LoadingPanel className="glass-bar px-5 py-4 sm:px-8" delay={70}>
              <div className="space-y-4">
                <LoadingBlock className="h-2 w-20" delay={110} />
                <LoadingBlock className="h-11 w-full max-w-md" delay={150} />
                <LoadingBlock className="h-4 w-full max-w-2xl" delay={190} />
              </div>
            </LoadingPanel>
          </div>
          <div className="min-h-0 flex-1 pb-12 pt-2 lg:pb-16">
            <AppPageLoadingBody />
          </div>
        </div>
      </div>
    </div>
  );
}
