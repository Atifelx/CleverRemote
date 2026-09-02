import Link from "next/link";
import { CONCEPTS, CATEGORIES, LEARNING_PATH } from "@/lib/learn-data";

const levelColors: Record<number, string> = {
  1: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  2: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  3: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
};
const levelLabel: Record<number, string> = {
  1: "L1 Must Master",
  2: "L2 Recommended",
  3: "L3 Advanced",
};

export default function LearnPage() {
  const pathConcepts = LEARNING_PATH.map((slug) =>
    CONCEPTS.find((c) => c.slug === slug)!
  ).filter(Boolean);

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    concepts: CONCEPTS.filter((c) => c.category === cat.id).sort(
      (a, b) => a.order - b.order
    ),
  })).filter((cat) => cat.concepts.length > 0);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgb(var(--accent)) 0%, transparent 70%)" }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] text-[12px] font-medium mb-4">
            🧠 Machine Learning Tutorial
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[rgb(var(--fg))] mb-3">
            Learn Machine Learning — Master It
          </h1>
          <p className="text-[16px] text-[rgb(var(--fg-soft))] max-w-2xl leading-relaxed mb-6">
            A complete visual tutorial for engineers with no ML background. Go from zero to
            understanding transformers, LLMs, RAG, and agents — systematically.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={`/learn/${LEARNING_PATH[0]}`}
              className="px-5 py-2.5 rounded-lg bg-[rgb(var(--accent))] text-white text-[14px] font-semibold hover:opacity-90 transition"
            >
              Start from the beginning →
            </Link>
            <div className="flex items-center gap-3 text-[13px] text-[rgb(var(--muted))]">
              <span>{CONCEPTS.length} concepts</span>
              <span>·</span>
              <span>{CONCEPTS.filter((c) => c.level === 1).length} must-master</span>
              <span>·</span>
              <span>Visual diagrams included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level legend */}
      <div className="flex items-center gap-3 flex-wrap text-[12px]">
        <span className="text-[rgb(var(--muted))]">Levels:</span>
        {[1, 2, 3].map((l) => (
          <span key={l} className={`px-2.5 py-1 rounded-full font-medium ${levelColors[l]}`}>
            {levelLabel[l]}
          </span>
        ))}
      </div>

      {/* Learning Path (sequential) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[20px] font-semibold text-[rgb(var(--fg))]">📍 Recommended Learning Path</h2>
            <p className="text-[13px] text-[rgb(var(--muted))] mt-1">Follow this sequence — each concept builds on the previous.</p>
          </div>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgb(var(--border))]" />
          <div className="space-y-1">
            {pathConcepts.map((concept, idx) => (
              <Link
                key={concept.slug}
                href={`/learn/${concept.slug}`}
                className="group flex items-center gap-4 pl-0 pr-4 py-2.5 rounded-xl hover:bg-[rgb(var(--panel-2))] transition relative"
              >
                {/* Step bubble */}
                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold z-10 transition
                  ${idx < 12
                    ? "bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/30 group-hover:bg-[rgb(var(--accent))] group-hover:text-white"
                    : "bg-[rgb(var(--panel))] text-[rgb(var(--muted))] border border-[rgb(var(--border))] group-hover:border-[rgb(var(--accent))]/50"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition">
                      {concept.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColors[concept.level]}`}>
                      L{concept.level}
                    </span>
                    <span className="text-[11px] text-[rgb(var(--muted))]">{concept.category}</span>
                  </div>
                  <p className="text-[12px] text-[rgb(var(--muted))] mt-0.5 line-clamp-1">{concept.tagline}</p>
                </div>
                <svg className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] flex-shrink-0 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section>
        <h2 className="text-[20px] font-semibold text-[rgb(var(--fg))] mb-5">📚 Browse by Category</h2>
        <div className="space-y-6">
          {byCategory.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]/50">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">{cat.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[rgb(var(--fg))]">{cat.id}</h3>
                    <p className="text-[12px] text-[rgb(var(--muted))]">{cat.desc}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-[rgb(var(--border))]">
                {cat.concepts.map((concept) => (
                  <Link
                    key={concept.slug}
                    href={`/learn/${concept.slug}`}
                    className="group flex items-center gap-3 px-5 py-3.5 hover:bg-[rgb(var(--panel-2))] transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition">
                          {concept.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColors[concept.level]}`}>
                          {levelLabel[concept.level]}
                        </span>
                      </div>
                      <p className="text-[12px] text-[rgb(var(--muted))] mt-0.5">{concept.tagline}</p>
                    </div>
                    <svg className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] flex-shrink-0 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Link to practice questions */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[16px] font-semibold text-[rgb(var(--fg))]">Ready to test your knowledge?</h3>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            Practice with 74 AI engineering questions at Toptal/Andela interview caliber.
          </p>
        </div>
        <Link
          href="/module/ai-engineering-deep"
          className="px-5 py-2.5 rounded-lg border border-[rgb(var(--accent))] text-[rgb(var(--accent))] text-[14px] font-medium hover:bg-[rgb(var(--accent))]/10 transition flex-shrink-0"
        >
          Practice Questions →
        </Link>
      </section>
    </div>
  );
}
