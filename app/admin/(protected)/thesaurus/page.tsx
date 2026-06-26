"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

type ThesaurusEntry = {
  id: string;
  languageId: string;
  word: string;
  related: string;
  relation: string;
};

export default function ThesaurusAdminPage() {
  return (
    <ResourceManager<ThesaurusEntry>
      title="Thesaurus"
      description="Link source-language words to synonyms and related terms to improve translation coverage."
      endpoint="/api/admin/thesaurus"
      fields={[
        { key: "languageId", label: "Language ID", required: true },
        { key: "word", label: "Word", required: true },
        { key: "related", label: "Related word", required: true },
        {
          key: "relation",
          label: "Relation",
          type: "select",
          required: true,
          options: [
            { value: "SYNONYM", label: "Synonym" },
            { value: "ANTONYM", label: "Antonym" },
            { value: "RELATED", label: "Related" },
          ],
        },
      ]}
      columns={[
        { key: "word", label: "Word" },
        { key: "related", label: "Related" },
        { key: "relation", label: "Relation" },
      ]}
      getInitialForm={(languageId) => ({
        languageId,
        word: "",
        related: "",
        relation: "SYNONYM",
      })}
      mapItemToRow={(item) => ({
        languageId: item.languageId,
        word: item.word,
        related: item.related,
        relation: item.relation,
      })}
    />
  );
}
