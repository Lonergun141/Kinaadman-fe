import { cx } from "@/lib/utils";

function LoadingBlock({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("loading-block", className)} />;
}

function AppPageLoadingBody() {
  return (
    <div className="page-shell space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <LoadingBlock className="h-3 w-32 rounded-full" />
        <LoadingBlock className="h-12 w-full max-w-3xl rounded-full" />
        <LoadingBlock className="h-4 w-full max-w-2xl rounded-full" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="paper-panel px-5 py-6">
            <LoadingBlock className="h-1.5 w-14 rounded-full" />
            <LoadingBlock className="mt-4 h-3 w-24 rounded-full" />
            <LoadingBlock className="mt-5 h-10 w-20 rounded-full" />
            <LoadingBlock className="mt-4 h-4 w-full rounded-full" />
            <LoadingBlock className="mt-2 h-4 w-4/5 rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
        <div className="paper-panel px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-5">
            <LoadingBlock className="h-3 w-28 rounded-full" />
            <LoadingBlock className="h-10 w-full max-w-2xl rounded-full" />
            <LoadingBlock className="h-4 w-full rounded-full" />
            <LoadingBlock className="h-4 w-5/6 rounded-full" />
            <LoadingBlock className="mt-8 h-56 rounded-[0.5rem]" />
          </div>
        </div>
        <div className="paper-panel px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-4">
            <LoadingBlock className="h-3 w-24 rounded-full" />
            <LoadingBlock className="h-4 w-2/3 rounded-full" />
            <LoadingBlock className="h-28 rounded-[0.5rem]" />
            <LoadingBlock className="h-28 rounded-[0.5rem]" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function RootLoadingScreen() {
  return (
    <main className="archive-grid flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
      <div className="paper-panel w-full max-w-3xl px-8 py-12 sm:px-12">
        <div className="space-y-6 text-center">
          <LoadingBlock className="mx-auto h-3 w-32 rounded-full" />
          <LoadingBlock className="mx-auto h-16 w-full max-w-2xl rounded-full" />
          <LoadingBlock className="mx-auto h-4 w-full max-w-xl rounded-full" />
          <LoadingBlock className="mx-auto h-4 w-full max-w-lg rounded-full" />
          <div className="flex justify-center">
            <LoadingBlock className="h-11 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function PublicPageLoadingScreen() {
  return (
    <main className="archive-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1480px] gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="dark-rail rounded-[0.5rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="space-y-6">
            <LoadingBlock className="h-3 w-32 rounded-full bg-white/14" />
            <LoadingBlock className="h-20 w-full rounded-[0.5rem] bg-white/12" />
            <LoadingBlock className="h-4 w-full max-w-xl rounded-full bg-white/10" />
            <LoadingBlock className="h-4 w-5/6 rounded-full bg-white/8" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rail-panel px-4 py-5">
                  <LoadingBlock className="h-3 w-24 rounded-full bg-white/12" />
                  <LoadingBlock className="mt-4 h-16 rounded-[0.5rem] bg-white/8" />
                </div>
              ))}
            </div>
          </div>
          <div className="rail-panel mt-8 px-5 py-5">
            <LoadingBlock className="h-3 w-28 rounded-full bg-white/12" />
            <LoadingBlock className="mt-4 h-16 rounded-[0.5rem] bg-white/8" />
          </div>
        </section>

        <section className="flex items-center">
          <div className="paper-panel w-full px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <LoadingBlock className="h-3 w-24 rounded-full" />
                <LoadingBlock className="h-12 w-full max-w-md rounded-full" />
                <LoadingBlock className="h-4 w-full rounded-full" />
                <LoadingBlock className="h-4 w-5/6 rounded-full" />
              </div>
              <div className="grid gap-4">
                <LoadingBlock className="h-14 rounded-sm" />
                <LoadingBlock className="h-14 rounded-sm" />
                <LoadingBlock className="h-14 rounded-sm" />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <LoadingBlock className="h-10 w-full max-w-sm rounded-[0.5rem]" />
                <LoadingBlock className="h-12 w-44 rounded-sm" />
              </div>
            </div>
          </div>
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
            <div className="rail-panel px-4 py-5">
              <LoadingBlock className="h-3 w-28 rounded-full bg-white/14" />
              <LoadingBlock className="mt-4 h-10 w-40 rounded-full bg-white/12" />
              <LoadingBlock className="mt-4 h-20 rounded-[0.5rem] bg-white/8" />
            </div>
            <div className="flex-1 px-2 pt-6">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <LoadingBlock className="h-3 w-20 rounded-full bg-white/10" />
                    {Array.from({ length: 2 }).map((__, itemIndex) => (
                      <LoadingBlock
                        key={itemIndex}
                        className="h-12 rounded-[0.5rem] bg-white/8"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="rail-panel mt-4 px-4 py-4">
              <LoadingBlock className="h-12 rounded-[0.5rem] bg-white/8" />
              <LoadingBlock className="mt-4 h-16 rounded-[0.5rem] bg-white/8" />
              <LoadingBlock className="mt-4 h-10 rounded-sm bg-white/10" />
            </div>
          </div>
        </aside>

        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-[color:var(--color-background)]">
          <div className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
            <div className="glass-bar px-5 py-4 sm:px-8">
              <div className="space-y-4">
                <LoadingBlock className="h-3 w-20 rounded-full" />
                <LoadingBlock className="h-12 w-full max-w-md rounded-full" />
                <LoadingBlock className="h-4 w-full max-w-2xl rounded-full" />
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 pb-12 pt-2 lg:pb-16">
            <AppPageLoadingBody />
          </div>
        </div>
      </div>
    </div>
  );
}
