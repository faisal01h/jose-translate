import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [languages, dictionaryCount, vocabularyCount, rulesCount, thesaurusCount] =
    await Promise.all([
      prisma.language.count(),
      prisma.dictionaryEntry.count(),
      prisma.vocabulary.count(),
      prisma.grammaticalRule.count(),
      prisma.thesaurusEntry.count(),
    ]);

  const cards = [
    { label: "Languages", value: languages, href: "/admin/languages" },
    { label: "Dictionary entries", value: dictionaryCount, href: "/admin/dictionary" },
    { label: "Vocabulary items", value: vocabularyCount, href: "/admin/vocabulary" },
    { label: "Grammar rules", value: rulesCount, href: "/admin/rules" },
    { label: "Thesaurus links", value: thesaurusCount, href: "/admin/thesaurus" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div>
        <h2 className="text-3xl font-semibold">Dashboard</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage fictional languages, dictionaries, grammar, and thesaurus data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-3xl border border-zinc-200 bg-white p-6 transition hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
