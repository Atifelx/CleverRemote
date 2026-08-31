"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/storage";

export function ResumeButton() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProgress();
    if (p.lastModuleId && p.lastQuestionId) {
      setHref(`/module/${p.lastModuleId}/question/${p.lastQuestionId}`);
    }
  }, []);

  if (!href) return null;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[rgb(var(--accent))] text-white text-[13px] font-medium hover:opacity-90 transition"
    >
      ↻ Resume last
    </Link>
  );
}
