"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/orders", label: "Orders & Sales" },
  { href: "/admin/visitors", label: "Visitors" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 p-2 rounded-xl bg-ink-900/50 border border-ink-800 w-fit">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === href
              ? "bg-ink-800 text-stone-100"
              : "text-ink-500 hover:text-stone-200 hover:bg-ink-800/50"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
