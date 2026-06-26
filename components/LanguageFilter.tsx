"use client";

type Language = {
  id: string;
  name: string;
  code: string;
};

type LanguageFilterProps = {
  languages: Language[];
  value: string;
  onChange: (languageId: string) => void;
};

export function LanguageFilter({
  languages,
  value,
  onChange,
}: LanguageFilterProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Filter by language
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-300 bg-transparent px-4 py-2 dark:border-zinc-700"
      >
        <option value="">All languages</option>
        {languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
