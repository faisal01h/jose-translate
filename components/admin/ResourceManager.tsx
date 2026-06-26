"use client";

import { useEffect, useState } from "react";
import { LanguageFilter } from "@/components/LanguageFilter";

type Language = {
  id: string;
  name: string;
  code: string;
};

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "checkbox" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
};

type ResourceManagerProps<T extends { id: string }> = {
  title: string;
  description: string;
  endpoint: string;
  fields: FieldConfig[];
  columns: { key: string; label: string }[];
  getInitialForm: (languageId: string) => Record<string, string | number | boolean>;
  mapItemToRow: (item: T) => Record<string, string | number | boolean>;
};

export function ResourceManager<T extends { id: string }>({
  title,
  description,
  endpoint,
  fields,
  columns,
  getInitialForm,
  mapItemToRow,
}: ResourceManagerProps<T>) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, string | number | boolean>>(
    {},
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguages() {
      const response = await fetch("/api/admin/languages");
      const data = await response.json();
      const nextLanguages = data.languages ?? [];
      setLanguages(nextLanguages);
      if (nextLanguages[0]) {
        setLanguageId(nextLanguages[0].id);
        setForm(getInitialForm(nextLanguages[0].id));
      }
      setLoading(false);
    }
    loadLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadItems() {
      const query = languageId ? `?languageId=${languageId}` : "";
      const response = await fetch(`${endpoint}${query}`);
      const data = await response.json();
      const key = Object.keys(data).find((entry) => Array.isArray(data[entry]));
      setItems(key ? data[key] : []);
    }
    if (!loading) {
      loadItems();
    }
  }, [endpoint, languageId, loading]);

  function resetForm(nextLanguageId = languageId) {
    setEditingId(null);
    setForm(getInitialForm(nextLanguageId));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${endpoint}/${editingId}` : endpoint;
    const payload = {
      ...form,
      ...(languageId ? { languageId } : {}),
    };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Save failed");
      return;
    }

    resetForm();
    const query = languageId ? `?languageId=${languageId}` : "";
    const refreshed = await fetch(`${endpoint}${query}`);
    const data = await refreshed.json();
    const key = Object.keys(data).find((entry) => Array.isArray(data[entry]));
    setItems(key ? data[key] : []);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function startEdit(item: T) {
    setEditingId(item.id);
    setForm(mapItemToRow(item));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div>
        <h2 className="text-3xl font-semibold">{title}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      <LanguageFilter
        languages={languages}
        value={languageId}
        onChange={(nextLanguageId) => {
          setLanguageId(nextLanguageId);
          if (!editingId) {
            setForm(getInitialForm(nextLanguageId));
          }
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="text-lg font-medium">
          {editingId ? "Edit entry" : "Add entry"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {fields
            .filter((field) => field.key !== "languageId")
            .map((field) => {
            if (field.type === "checkbox") {
              return (
                <label
                  key={field.key}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.key]: event.target.checked,
                      }))
                    }
                  />
                  {field.label}
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label key={field.key} className="grid gap-2 text-sm font-medium">
                  {field.label}
                  <select
                    value={String(form[field.key] ?? "")}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-zinc-300 bg-transparent px-4 py-2 dark:border-zinc-700"
                    required={field.required}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            const InputTag = field.type === "textarea" ? "textarea" : "input";

            return (
              <label key={field.key} className="grid gap-2 text-sm font-medium">
                {field.label}
                <InputTag
                  type={field.type === "number" ? "number" : "text"}
                  value={String(form[field.key] ?? "")}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]:
                        field.type === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                    }))
                  }
                  rows={field.type === "textarea" ? 3 : undefined}
                  className="rounded-xl border border-zinc-300 bg-transparent px-4 py-2 dark:border-zinc-700"
                  required={field.required}
                />
              </label>
            );
          })}
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
              onClick={() => resetForm()}
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
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const row = mapItemToRow(item);
              return (
                <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {String(row[column.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-amber-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
