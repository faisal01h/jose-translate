"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

type DictionaryEntry = {
  id: string;
  languageId: string;
  sourceWord: string;
  targetWord: string;
  partOfSpeech: string | null;
  notes: string | null;
};

export default function DictionaryAdminPage() {
  return (
    <ResourceManager<DictionaryEntry>
      title="Dictionary"
      description="Map real-language words to their fictional translations."
      endpoint="/api/admin/dictionary"
      fields={[
        { key: "languageId", label: "Language ID", required: true },
        { key: "sourceWord", label: "Source word", required: true },
        { key: "targetWord", label: "Target word", required: true },
        { key: "partOfSpeech", label: "Part of speech" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      columns={[
        { key: "sourceWord", label: "Source" },
        { key: "targetWord", label: "Target" },
        { key: "partOfSpeech", label: "POS" },
      ]}
      getInitialForm={(languageId) => ({
        languageId,
        sourceWord: "",
        targetWord: "",
        partOfSpeech: "",
        notes: "",
      })}
      mapItemToRow={(item) => ({
        languageId: item.languageId,
        sourceWord: item.sourceWord,
        targetWord: item.targetWord,
        partOfSpeech: item.partOfSpeech ?? "",
        notes: item.notes ?? "",
      })}
    />
  );
}
