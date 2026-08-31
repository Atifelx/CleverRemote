import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Turing Prep — FDE Remote Interview Bank",
  description:
    "Practice bank for Turing.com, Andela, and Toptal — targeting remote Forward Deployed Engineer roles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="text-accent">turing</span>·prep
            </Link>
            <nav className="text-sm text-muted flex gap-6">
              <Link href="/" className="hover:text-fg">Home</Link>
              <Link href="/plans/60-day" className="hover:text-fg">60-day</Link>
              <Link href="/plans/20-day" className="hover:text-fg">20-day</Link>
              <Link href="/plans/asap" className="hover:text-fg">ASAP</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted">
            Private practice bank · localStorage only · v1
          </div>
        </footer>
      </body>
    </html>
  );
}
