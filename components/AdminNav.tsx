"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/languages", label: "Languages" },
  { href: "/admin/dictionary", label: "Dictionary" },
  { href: "/admin/vocabulary", label: "Vocabulary" },
  { href: "/admin/rules", label: "Grammar Rules" },
  { href: "/admin/thesaurus", label: "Thesaurus" },
];

export function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-700">
            Admin
          </p>
          <h1 className="text-lg font-semibold">José Translate</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          >
            Translator
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
