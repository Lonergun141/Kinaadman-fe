export default function AppLoading() {
  return (
    <div className="page-shell space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-12 w-full max-w-3xl rounded-full bg-slate-200" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white px-5 py-6"
          >
            <div className="h-1.5 w-14 rounded-full bg-slate-200" />
            <div className="mt-4 h-3 w-24 rounded-full bg-slate-200" />
            <div className="mt-5 h-10 w-20 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="paper-panel h-[28rem] bg-white" />
        <div className="paper-panel h-[20rem] bg-white" />
      </section>
    </div>
  );
}
