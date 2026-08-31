"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/storage";

export function ResumeButton() {
  const [href, setHref] = useState<string | null>(null);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const p = loadProgress();
    if (p.lastModuleId && p.lastQuestionId) {
      setHref(`/module/${p.lastModuleId}/question/${p.lastQuestionId}`);
      setLabel(`Resume: ${p.lastModuleId} · ${p.lastQuestionId}`);
    }
  }, []);

  if (!href) return null;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md bg-accent/20 border border-accent/40 px-4 py-2 text-accent hover:bg-accent/30 transition"
    >
      ↻ {label}
    </Link>
  );
}
