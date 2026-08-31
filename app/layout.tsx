import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CleverRemote — Turing & Andela Prep",
  description:
    "Timed practice for remote Forward Deployed Engineer offers at Turing and Andela.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="mx-auto max-w-[1200px] px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-[15px] font-semibold tracking-tight text-[rgb(var(--brand))]">
                Clever<span className="text-[rgb(var(--accent))]">Remote</span>
              </Link>
              <nav className="flex items-center gap-1 text-[13px]">
                <TabLink href="/?track=all" label="All" />
                <TabLink href="/?track=turing" label="Turing" />
                <TabLink href="/?track=andela" label="Andela" />
                <TabLink href="/plans/60-day" label="Plans" />
              </nav>
            </div>
            <div className="text-[12px] text-[rgb(var(--muted))]">
              Local · localStorage progress
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-6 py-8">{children}</main>
        <footer className="border-t border-[rgb(var(--border))] mt-16">
          <div className="mx-auto max-w-[1200px] px-6 py-5 text-[11px] text-[rgb(var(--muted))]">
            v3 — 30-topic taxonomy — private practice
          </div>
        </footer>
      </body>
    </html>
  );
}

function TabLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-[rgb(var(--fg-soft))] hover:bg-[rgb(var(--panel-2))] hover:text-[rgb(var(--fg))] transition"
    >
      {label}
    </Link>
  );
}
