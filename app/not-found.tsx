import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-4xl mb-2">404</h1>
      <p className="text-muted mb-6">Nothing here.</p>
      <Link href="/" className="text-accent hover:underline">
        Home
      </Link>
    </div>
  );
}
