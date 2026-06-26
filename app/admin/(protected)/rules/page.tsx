"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

type GrammaticalRule = {
  id: string;
  languageId: string;
  name: string;
  description: string | null;
  ruleType: string;
  pattern: string;
  replacement: string;
  priority: number;
  isActive: boolean;
};

export default function RulesAdminPage() {
  return (
    <ResourceManager<GrammaticalRule>
      title="Grammar Rules"
      description="Apply prefixes, suffixes, replacements, regex, or word-order transforms after dictionary lookup."
      endpoint="/api/admin/rules"
      fields={[
        { key: "languageId", label: "Language ID", required: true },
        { key: "name", label: "Name", required: true },
        { key: "description", label: "Description", type: "textarea" },
        {
          key: "ruleType",
          label: "Rule type",
          type: "select",
          required: true,
          options: [
            { value: "PREFIX", label: "Prefix" },
            { value: "SUFFIX", label: "Suffix" },
            { value: "REPLACE", label: "Replace" },
            { value: "REGEX", label: "Regex" },
            { value: "WORD_ORDER", label: "Word order" },
          ],
        },
        { key: "pattern", label: "Pattern", required: true },
        { key: "replacement", label: "Replacement" },
        { key: "priority", label: "Priority", type: "number" },
        { key: "isActive", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "ruleType", label: "Type" },
        { key: "pattern", label: "Pattern" },
        { key: "priority", label: "Priority" },
      ]}
      getInitialForm={(languageId) => ({
        languageId,
        name: "",
        description: "",
        ruleType: "REPLACE",
        pattern: "",
        replacement: "",
        priority: 0,
        isActive: true,
      })}
      mapItemToRow={(item) => ({
        languageId: item.languageId,
        name: item.name,
        description: item.description ?? "",
        ruleType: item.ruleType,
        pattern: item.pattern,
        replacement: item.replacement,
        priority: item.priority,
        isActive: item.isActive,
      })}
    />
  );
}
