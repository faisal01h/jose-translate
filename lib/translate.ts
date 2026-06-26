import type {
  DictionaryEntry,
  GrammaticalRule,
  ThesaurusEntry,
} from "@/generated/prisma/client";

export type TranslationContext = {
  dictionary: Map<string, string>;
  phrases: PhraseEntry[];
  rules: GrammaticalRule[];
  thesaurus: Map<string, string[]>;
  reverseDictionary?: Map<string, string>;
  reversePhrases?: PhraseEntry[];
  reverseThesaurus?: Map<string, string[]>;
};

export type TranslationResult = {
  translated: string;
  unknownWords: string[];
  matchedWords: string[];
};

type PhraseEntry = {
  phrase: string;
  translation: string;
  wordCount: number;
};

const WORD_CHAR = /[a-zA-Z]/;
const SINGLE_WORD_PATTERN = /^[a-zA-Z]+(?:'[a-zA-Z]+)?/;

function normalizePhrase(phrase: string) {
  return phrase.toLowerCase().trim().replace(/\s+/g, " ");
}

function buildDictionaryMap(entries: DictionaryEntry[]) {
  const map = new Map<string, string>();
  for (const entry of entries) {
    map.set(normalizePhrase(entry.sourceWord), entry.targetWord);
  }
  return map;
}

function buildReverseDictionaryMap(entries: DictionaryEntry[]) {
  const map = new Map<string, string>();
  for (const entry of entries) {
    const key = normalizePhrase(entry.targetWord);
    if (!map.has(key)) {
      map.set(key, entry.sourceWord);
    }
  }
  return map;
}

function buildPhraseList(dictionary: Map<string, string>): PhraseEntry[] {
  return [...dictionary.entries()]
    .map(([phrase, translation]) => ({
      phrase,
      translation,
      wordCount: phrase.split(/\s+/).filter(Boolean).length,
    }))
    .sort(
      (a, b) =>
        b.wordCount - a.wordCount ||
        b.phrase.length - a.phrase.length,
    );
}

function buildReverseThesaurusMap(
  entries: ThesaurusEntry[],
  dictionary: Map<string, string>,
) {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    const sourceKey = normalizePhrase(entry.word);
    const targetWord = dictionary.get(sourceKey);
    if (!targetWord) continue;

    const targetKey = normalizePhrase(targetWord);
    const relatedTarget = dictionary.get(normalizePhrase(entry.related));
    const related = relatedTarget
      ? normalizePhrase(relatedTarget)
      : normalizePhrase(entry.related);

    const existing = map.get(targetKey) ?? [];
    existing.push(related);
    map.set(targetKey, existing);
  }
  return map;
}

function buildThesaurusMap(entries: ThesaurusEntry[]) {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    const key = normalizePhrase(entry.word);
    const existing = map.get(key) ?? [];
    existing.push(normalizePhrase(entry.related));
    map.set(key, existing);
  }
  return map;
}

function isPhraseMatchAt(text: string, index: number, phrase: string) {
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();

  if (!lowerText.startsWith(lowerPhrase, index)) {
    return false;
  }

  const before = index > 0 ? text[index - 1] : "";
  const afterIndex = index + phrase.length;
  const after = afterIndex < text.length ? text[afterIndex] : "";

  if (before && WORD_CHAR.test(before)) {
    return false;
  }

  if (after && WORD_CHAR.test(after)) {
    return false;
  }

  return true;
}

function lookupSingleWord(word: string, dictionary: Map<string, string>) {
  const normalized = normalizePhrase(word);
  if (dictionary.has(normalized)) {
    return dictionary.get(normalized)!;
  }

  const variants = [
    normalized.replace(/ies$/, "y"),
    normalized.replace(/es$/, ""),
    normalized.replace(/s$/, ""),
  ];

  for (const variant of variants) {
    if (dictionary.has(variant)) {
      return dictionary.get(variant)!;
    }
  }

  return null;
}

function lookupReverseSingleWord(word: string, dictionary: Map<string, string>) {
  const normalized = normalizePhrase(word);
  if (dictionary.has(normalized)) {
    return dictionary.get(normalized)!;
  }

  const variants = [
    normalized.replace(/en$/, ""),
    normalized.replace(/ies$/, "y"),
    normalized.replace(/es$/, ""),
    normalized.replace(/s$/, ""),
  ];

  for (const variant of variants) {
    if (variant !== normalized && dictionary.has(variant)) {
      return dictionary.get(variant)!;
    }
  }

  return null;
}

function applyPhraseCase(sourcePhrase: string, targetPhrase: string) {
  const trimmedSource = sourcePhrase.trim();
  if (!trimmedSource) return targetPhrase;

  if (trimmedSource === trimmedSource.toUpperCase()) {
    return targetPhrase.toUpperCase();
  }

  if (trimmedSource[0] === trimmedSource[0].toUpperCase()) {
    return targetPhrase.charAt(0).toUpperCase() + targetPhrase.slice(1);
  }

  return targetPhrase;
}

function preserveCase(source: string, target: string) {
  if (source === source.toUpperCase()) {
    return target.toUpperCase();
  }
  if (source[0] === source[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function translateWithPhrases(
  text: string,
  dictionary: Map<string, string>,
  phrases: PhraseEntry[],
  thesaurus: Map<string, string[]>,
  lookupWord: (word: string, dict: Map<string, string>) => string | null,
): TranslationResult {
  const unknownWords: string[] = [];
  const matchedWords: string[] = [];
  let result = "";
  let index = 0;

  while (index < text.length) {
    if (!WORD_CHAR.test(text[index])) {
      result += text[index];
      index += 1;
      continue;
    }

    let matched = false;
    for (const entry of phrases) {
      if (!isPhraseMatchAt(text, index, entry.phrase)) {
        continue;
      }

      const original = text.slice(index, index + entry.phrase.length);
      result += applyPhraseCase(original, entry.translation);
      matchedWords.push(original.trim());
      index += entry.phrase.length;
      matched = true;
      break;
    }

    if (matched) {
      continue;
    }

    const remaining = text.slice(index);
    const wordMatch = remaining.match(SINGLE_WORD_PATTERN);
    if (!wordMatch) {
      result += text[index];
      index += 1;
      continue;
    }

    const word = wordMatch[0];
    const translation = lookupWord(word, dictionary);
    if (translation) {
      matchedWords.push(word);
      result += preserveCase(word, translation);
      index += word.length;
      continue;
    }

    const synonyms = thesaurus.get(normalizePhrase(word)) ?? [];
    let synonymMatch: string | null = null;
    for (const synonym of synonyms) {
      const synonymTranslation = lookupWord(synonym, dictionary);
      if (synonymTranslation) {
        synonymMatch = synonymTranslation;
        break;
      }
    }

    if (synonymMatch) {
      matchedWords.push(word);
      result += preserveCase(word, synonymMatch);
      index += word.length;
      continue;
    }

    unknownWords.push(word);
    result += word;
    index += word.length;
  }

  return {
    translated: result,
    unknownWords: [...new Set(unknownWords)],
    matchedWords: [...new Set(matchedWords)],
  };
}

function applyGrammaticalRules(text: string, rules: GrammaticalRule[]) {
  let result = text;
  const activeRules = [...rules]
    .filter((rule) => rule.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of activeRules) {
    switch (rule.ruleType) {
      case "PREFIX":
        result = `${rule.replacement}${result}`;
        break;
      case "SUFFIX":
        result = `${result}${rule.replacement}`;
        break;
      case "REPLACE":
        result = result.split(rule.pattern).join(rule.replacement);
        break;
      case "REGEX":
        try {
          const regex = new RegExp(rule.pattern, "gi");
          result = result.replace(regex, rule.replacement);
        } catch {
          // Skip invalid regex patterns.
        }
        break;
      case "WORD_ORDER":
        result = applyWordOrderRule(result, rule.pattern);
        break;
    }
  }

  return result;
}

function applyWordOrderRule(text: string, pattern: string) {
  const order = pattern
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (order.length === 0) return text;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < order.length) return text;

  const buckets: Record<string, string[]> = {};
  for (const key of order) {
    buckets[key] = [];
  }

  for (const word of words) {
    const lower = word.toLowerCase();
    const bucketKey = order.find((key) => lower.startsWith(`${key}:`));
    if (bucketKey) {
      buckets[bucketKey].push(word.slice(bucketKey.length + 1));
    } else if (order.includes("other")) {
      buckets.other.push(word);
    } else {
      buckets[order[order.length - 1]].push(word);
    }
  }

  return order.flatMap((key) => buckets[key]).join(" ");
}

function applyReverseGrammaticalRules(text: string, rules: GrammaticalRule[]) {
  let result = text.trimEnd();
  const activeRules = [...rules]
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of activeRules) {
    switch (rule.ruleType) {
      case "SUFFIX":
        if (rule.replacement) {
          while (result.endsWith(rule.replacement)) {
            result = result.slice(0, -rule.replacement.length).trimEnd();
          }
        }
        break;
      case "PREFIX":
        if (rule.replacement && result.startsWith(rule.replacement)) {
          result = result.slice(rule.replacement.length);
        }
        break;
    }
  }

  return result;
}

export function buildTranslationContext(
  dictionaryEntries: DictionaryEntry[],
  rules: GrammaticalRule[],
  thesaurusEntries: ThesaurusEntry[],
): TranslationContext {
  const dictionary = buildDictionaryMap(dictionaryEntries);
  const reverseDictionary = buildReverseDictionaryMap(dictionaryEntries);

  return {
    dictionary,
    phrases: buildPhraseList(dictionary),
    rules,
    thesaurus: buildThesaurusMap(thesaurusEntries),
    reverseDictionary,
    reversePhrases: buildPhraseList(reverseDictionary),
    reverseThesaurus: buildReverseThesaurusMap(thesaurusEntries, dictionary),
  };
}

export function translateText(
  text: string,
  context: TranslationContext,
): TranslationResult {
  const result = translateWithPhrases(
    text,
    context.dictionary,
    context.phrases,
    context.thesaurus,
    lookupSingleWord,
  );

  return {
    ...result,
    translated: applyGrammaticalRules(result.translated, context.rules),
  };
}

export function translateTextFromFictional(
  text: string,
  context: TranslationContext,
): TranslationResult {
  const reverseDictionary = context.reverseDictionary ?? new Map();
  const reversePhrases = context.reversePhrases ?? [];
  const reverseThesaurus = context.reverseThesaurus ?? new Map();
  const normalizedText = applyReverseGrammaticalRules(text, context.rules);

  return translateWithPhrases(
    normalizedText,
    reverseDictionary,
    reversePhrases,
    reverseThesaurus,
    lookupReverseSingleWord,
  );
}
