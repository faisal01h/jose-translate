"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

type Vocabulary = {
  id: string;
  languageId: string;
  word: string;
  definition: string;
  partOfSpeech: string | null;
  example: string | null;
};

export default function VocabularyAdminPage() {
  return (
    <ResourceManager<Vocabulary>
      title="Vocabulary"
      description="Document fictional words with definitions and usage examples."
      endpoint="/api/admin/vocabulary"
      fields={[
        { key: "languageId", label: "Language ID", required: true },
        { key: "word", label: "Word", required: true },
        { key: "definition", label: "Definition", type: "textarea", required: true },
        { key: "partOfSpeech", label: "Part of speech" },
        { key: "example", label: "Example", type: "textarea" },
      ]}
      columns={[
        { key: "word", label: "Word" },
        { key: "definition", label: "Definition" },
        { key: "partOfSpeech", label: "POS" },
      ]}
      getInitialForm={(languageId) => ({
        languageId,
        word: "",
        definition: "",
        partOfSpeech: "",
        example: "",
      })}
      mapItemToRow={(item) => ({
        languageId: item.languageId,
        word: item.word,
        definition: item.definition,
        partOfSpeech: item.partOfSpeech ?? "",
        example: item.example ?? "",
      })}
    />
  );
}
