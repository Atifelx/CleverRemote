import Link from "next/link";

export function TrackFilter({ current }: { current: string }) {
  const options: { id: string; label: string; count?: string }[] = [
    { id: "all", label: "All" },
    { id: "turing", label: "Turing" },
    { id: "andela", label: "Andela" },
  ];
  return (
    <div className="flex items-center gap-1 text-[12px]">
      {options.map((o) => (
        <Link
          key={o.id}
          href={o.id === "all" ? "/" : `/?track=${o.id}`}
          className={`px-3 py-1.5 rounded-md border transition ${
            current === o.id
              ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))] border-[rgb(var(--fg))]"
              : "bg-[rgb(var(--panel))] text-[rgb(var(--fg-soft))] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
