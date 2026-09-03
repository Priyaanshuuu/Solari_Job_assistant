import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#101719] px-5 py-5 text-[#f2f5ef] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#f2f5ef]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee7655] text-base text-[#101719]">S</span>
            SOLARI / COPILOT
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#aebbb5]">
            <span className="hidden sm:inline">LOCAL WORKSPACE</span>
            <span className="h-2 w-2 rounded-full bg-[#75d19b]" aria-label="System ready" />
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-[#ee7655]">JOB SEARCH, WITH A SECOND BRAIN</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Find the roles worth your attention.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#aebbb5] sm:text-lg">
              Solari searches the web, keeps your shortlist focused, and shapes your resume around the opportunity in front of you.
            </p>
            <Link
              href="/copilot"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#ee7655] px-6 py-3 text-sm font-semibold text-[#101719] transition-transform hover:-translate-y-0.5"
            >
              Open copilot <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div className="border-l border-[#ee7655]/50 pl-6 lg:mb-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#aebbb5]">TODAY&apos;S BRIEF</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.03em]">Ready when you are.</p>
            <p className="mt-3 text-sm leading-6 text-[#aebbb5]">Start with a spoken request or use the copilot workspace to review your next move.</p>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            ["12", "saved opportunities", "from your last search"],
            ["04", "resume drafts", "ready to tailor"],
            ["86%", "profile coverage", "based on your current resume"],
          ].map(([value, label, detail]) => (
            <div key={label} className="bg-[#151e20] p-6">
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[#f2f5ef]">{value}</p>
              <p className="mt-3 text-sm font-medium text-[#f2f5ef]">{label}</p>
              <p className="mt-1 text-xs text-[#7f918a]">{detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 border-b border-white/10 py-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#ee7655]">WORKFLOW</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">One conversation, two useful outcomes.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm font-semibold">01 / Discover</p>
              <p className="mt-2 text-sm leading-6 text-[#aebbb5]">Search ATS boards through a voice request and keep the strongest matches together.</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm font-semibold">02 / Tailor</p>
              <p className="mt-2 text-sm leading-6 text-[#aebbb5]">Turn a selected job into a focused resume draft without inventing experience.</p>
            </div>
          </div>
        </section>
      </div>
      </main>
  );
}
