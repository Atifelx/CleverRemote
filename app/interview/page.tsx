import Link from "next/link";
import { GROUPS, QUESTIONS, getStats } from "@/lib/interview-data";

export default function InterviewPage() {
  const stats = getStats();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 40%, rgb(var(--accent)) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] text-[12px] font-medium mb-4">
            📝 AI/ML Interview Prep
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[rgb(var(--fg))] mb-3">
            Interview Question Bank
          </h1>
          <p className="text-[16px] text-[rgb(var(--fg-soft))] max-w-2xl leading-relaxed mb-5">
            {stats.total}+ questions across {GROUPS.length} concept groups — exactly the types
            and formats asked in Turing, Toptal, and Andela online assessments. Click a question to
            reveal the full answer and explanation.
          </p>
          <div className="flex flex-wrap gap-3 text-[13px]">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              {stats.byDiff.easy} Easy
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
              {stats.byDiff.medium} Medium
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
              {stats.byDiff.hard} Hard
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              {stats.total} Total
            </span>
          </div>
        </div>
      </div>

      {/* Platform badges */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <p className="text-[12px] text-[rgb(var(--muted))] mb-3 uppercase tracking-wider font-medium">
          Optimised for these platforms
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Turing", note: "MCQ + coding rounds, 60–90 min" },
            { name: "Toptal", note: "Deep technical interview, live coding" },
            { name: "Andela", note: "Conceptual + applied ML questions" },
            { name: "Upwork", note: "Skill assessments & portfolio tests" },
          ].map((p) => (
            <div
              key={p.name}
              className="px-4 py-2.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]"
            >
              <div className="text-[13px] font-semibold text-[rgb(var(--fg))]">{p.name}</div>
              <div className="text-[11px] text-[rgb(var(--muted))] mt-0.5">{p.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Concept groups grid */}
      <section>
        <h2 className="text-[20px] font-semibold text-[rgb(var(--fg))] mb-5">
          Choose a Concept Group
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.byGroup.map((g) => (
            <Link
              key={g.id}
              href={`/interview/${g.id}`}
              className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--panel-2))] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-[24px] mt-0.5">{g.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition">
                      {g.label}
                    </h3>
                    <p className="text-[12px] text-[rgb(var(--muted))] mt-1 leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-[22px] font-bold text-[rgb(var(--accent))]">{g.count}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">questions</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {/* difficulty dots */}
                  {(["easy", "medium", "hard"] as const).map((d) => {
                    const n = QUESTIONS.filter(
                      (q) => q.group === g.id && q.difficulty === d
                    ).length;
                    if (n === 0) return null;
                    const cls =
                      d === "easy"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : d === "medium"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-purple-500/20 text-purple-400";
                    return (
                      <span
                        key={d}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}
                      >
                        {n} {d}
                      </span>
                    );
                  })}
                </div>
                <svg
                  className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] transition"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6">
        <h3 className="text-[15px] font-semibold text-[rgb(var(--fg))] mb-4">How to use this section</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
          {[
            {
              step: "1",
              title: "Read the question",
              body: "Attempt to answer it in your head or on paper before revealing.",
            },
            {
              step: "2",
              title: "Reveal & compare",
              body: "Click to see the model answer and detailed explanation.",
            },
            {
              step: "3",
              title: "Track progress",
              body: "Your answered questions are saved in localStorage — revisit weak areas.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[rgb(var(--accent))]/15 border border-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <div className="font-medium text-[rgb(var(--fg))]">{s.title}</div>
                <div className="text-[rgb(var(--muted))] mt-0.5 leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Link to learn */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-[13px]">
          <span className="font-medium text-[rgb(var(--fg))]">Haven't learned the concepts yet?</span>
          <span className="text-[rgb(var(--muted))]"> Start with the visual tutorial first, then come back here.</span>
        </div>
        <Link
          href="/learn"
          className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--fg-soft))] text-[13px] hover:border-[rgb(var(--accent))]/50 hover:text-[rgb(var(--accent))] transition flex-shrink-0"
        >
          🧠 Learn ML →
        </Link>
      </div>
    </div>
  );
}
