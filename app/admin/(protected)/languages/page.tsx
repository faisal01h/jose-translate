"use client";

import { useEffect, useState } from "react";

type Language = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sourceLanguage: string;
  isActive: boolean;
  _count: {
    dictionaryEntries: number;
    vocabularies: number;
    grammaticalRules: number;
    thesaurusEntries: number;
  };
};

const emptyForm = {
  name: "",
  code: "",
  description: "",
  sourceLanguage: "en",
  isActive: true,
};

export default function LanguagesAdminPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadLanguages() {
    const response = await fetch("/api/admin/languages");
    const data = await response.json();
    setLanguages(data.languages ?? []);
  }

  useEffect(() => {
    loadLanguages();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `/api/admin/languages/${editingId}`
      : "/api/admin/languages";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Save failed");
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    await loadLanguages();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this language and all related data?")) return;
    await fetch(`/api/admin/languages/${id}`, { method: "DELETE" });
    await loadLanguages();
  }

  function startEdit(language: Language) {
    setEditingId(language.id);
    setForm({
      name: language.name,
      code: language.code,
      description: language.description ?? "",
      sourceLanguage: language.sourceLanguage,
      isActive: language.isActive,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div>
        <h2 className="text-3xl font-semibold">Languages</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Create fictional languages mapped from a real source language.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="text-lg font-medium">
          {editingId ? "Edit language" : "Add language"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: "name", label: "Name" },
            { key: "code", label: "Code (slug)" },
            { key: "sourceLanguage", label: "Source language (e.g. en)" },
            { key: "description", label: "Description" },
          ].map((field) => (
            <label key={field.key} className="grid gap-2 text-sm font-medium">
              {field.label}
              <input
                value={String(form[field.key as keyof typeof form] ?? "")}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 bg-transparent px-4 py-2 dark:border-zinc-700"
                required={field.key !== "description"}
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            Active for public translation
          </label>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white"
          >
            {editingId ? "Update" : "Create"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Counts</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language) => (
              <tr
                key={language.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="px-4 py-3">{language.name}</td>
                <td className="px-4 py-3">{language.code}</td>
                <td className="px-4 py-3">{language.sourceLanguage}</td>
                <td className="px-4 py-3">
                  {language._count.dictionaryEntries} dict ·{" "}
                  {language._count.vocabularies} vocab ·{" "}
                  {language._count.grammaticalRules} rules
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(language)}
                      className="text-amber-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(language.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
