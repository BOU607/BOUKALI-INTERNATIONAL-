import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="text-ink-500 hover:text-stone-300 text-sm">
            ← Back to store
          </Link>
          <h1 className="font-display text-2xl font-semibold text-stone-100 mt-1">
            Admin
          </h1>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
