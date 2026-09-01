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
        <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-[1200px] px-6 h-14 flex items-center justify-between">
            {/* Brand + nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-[15px] font-semibold tracking-tight text-[rgb(var(--brand))]">
                Clever<span className="text-[rgb(var(--accent))]">Remote</span>
              </Link>

              <nav className="flex items-center gap-0.5 text-[13px]">
                {/* Platform tabs */}
                <NavTab href="/?platform=turing" label="⚡ Turing" />
                <NavTab href="/?platform=andela" label="🌍 Andela" />
                <div className="w-px h-4 bg-[rgb(var(--border))] mx-1" />
                <NavTab href="/plans/60-day" label="Study Plans" />
                <NavTab href="/?platform=all" label="All Topics" />
              </nav>
            </div>

            {/* Right side */}
            <div className="text-[11px] text-[rgb(var(--muted))]">
              localStorage · private
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] px-6 py-8">{children}</main>

        <footer className="border-t border-[rgb(var(--border))] mt-16">
          <div className="mx-auto max-w-[1200px] px-6 py-5 text-[11px] text-[rgb(var(--muted))] flex items-center justify-between">
            <span>CleverRemote · private practice tool</span>
            <span>Turing + Andela · 29-stage syllabus</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-[rgb(var(--fg-soft))] hover:bg-[rgb(var(--panel-2))] hover:text-[rgb(var(--fg))] transition"
    >
      {label}
    </Link>
  );
}
