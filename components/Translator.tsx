"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Language = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sourceLanguage: string;
};

type TranslationResponse = {
  translated: string;
  unknownWords: string[];
  matchedWords: string[];
  direction: "to-fictional" | "from-fictional";
  language: {
    name: string;
    code: string;
    sourceLanguage: string;
  };
};

const SOURCE_REAL = "source-real";

function SwapIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99V11zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

export function Translator() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sourceLang, setSourceLang] = useState(SOURCE_REAL);
  const [targetLang, setTargetLang] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fictionalCode =
    sourceLang === SOURCE_REAL ? targetLang : sourceLang;
  const selectedLanguage = languages.find((lang) => lang.code === fictionalCode);

  const getRealLanguageLabel = useCallback(
    (code: string) => {
      const labels: Record<string, string> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        id: "Indonesian",
      };
      return labels[code] ?? code.toUpperCase();
    },
    [],
  );

  const getLangLabel = useCallback(
    (langKey: string) => {
      if (langKey === SOURCE_REAL) {
        return getRealLanguageLabel(selectedLanguage?.sourceLanguage ?? "en");
      }
      const lang = languages.find((item) => item.code === langKey);
      return lang?.name ?? langKey;
    },
    [getRealLanguageLabel, languages, selectedLanguage?.sourceLanguage],
  );

  const direction: "to-fictional" | "from-fictional" =
    sourceLang === SOURCE_REAL ? "to-fictional" : "from-fictional";

  const translate = useCallback(
    async (text: string, code: string, dir: "to-fictional" | "from-fictional") => {
      if (!text.trim() || !code) {
        setOutputText("");
        setUnknownWords([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            languageCode: code,
            direction: dir,
          }),
        });

        const data: TranslationResponse & { error?: string } =
          await response.json();

        if (!response.ok) {
          setError(data.error ?? "Translation failed");
          setOutputText("");
          return;
        }

        setOutputText(data.translated);
        setUnknownWords(data.unknownWords);
      } catch {
        setError("Could not reach the translation service.");
        setOutputText("");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    async function loadLanguages() {
      const response = await fetch("/api/translate");
      const data = await response.json();
      const loaded: Language[] = data.languages ?? [];
      setLanguages(loaded);
      if (loaded[0]) {
        setTargetLang(loaded[0].code);
      }
    }
    loadLanguages();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!inputText.trim()) {
      setOutputText("");
      setUnknownWords([]);
      setError("");
      return;
    }

    debounceRef.current = setTimeout(() => {
      translate(inputText, fictionalCode, direction);
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText, fictionalCode, direction, translate]);

  function swapLanguages() {
    const nextSource = targetLang;
    const nextTarget = sourceLang;
    setSourceLang(nextSource);
    setTargetLang(nextTarget);

    if (outputText) {
      setInputText(outputText);
      setOutputText("");
    }
  }

  function handleSourceChange(value: string) {
    if (value === SOURCE_REAL) {
      const previousFictional =
        sourceLang !== SOURCE_REAL ? sourceLang : targetLang;
      setSourceLang(SOURCE_REAL);
      setTargetLang(
        previousFictional !== SOURCE_REAL
          ? previousFictional
          : (languages[0]?.code ?? ""),
      );
    } else {
      setSourceLang(value);
      setTargetLang(SOURCE_REAL);
    }
  }

  function handleTargetChange(value: string) {
    if (value === SOURCE_REAL) {
      const previousFictional =
        targetLang !== SOURCE_REAL ? targetLang : sourceLang;
      setTargetLang(SOURCE_REAL);
      setSourceLang(
        previousFictional !== SOURCE_REAL
          ? previousFictional
          : (languages[0]?.code ?? ""),
      );
    } else {
      setTargetLang(value);
      setSourceLang(SOURCE_REAL);
    }
  }

  const sourceOptions = [
    { value: SOURCE_REAL, label: getRealLanguageLabel(selectedLanguage?.sourceLanguage ?? "en") },
    ...languages.map((lang) => ({ value: lang.code, label: lang.name })),
  ];

  const targetOptions = [
    { value: SOURCE_REAL, label: getRealLanguageLabel(selectedLanguage?.sourceLanguage ?? "en") },
    ...languages.map((lang) => ({ value: lang.code, label: lang.name })),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-sm">
          {/* Language bar */}
          <div className="flex shrink-0 flex-col border-b border-[#dadce0] sm:flex-row sm:items-stretch">
            <div className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#dadce0] px-3 py-2 sm:border-b-0 sm:border-r sm:px-4">
              <select
                value={sourceLang}
                onChange={(event) => handleSourceChange(event.target.value)}
                className="w-full min-w-0 cursor-pointer appearance-none bg-transparent py-2 text-sm font-medium text-[#3c4043] outline-none sm:text-[15px]"
                aria-label="Source language"
              >
                {sourceOptions.map((option) => (
                  <option
                    key={`source-${option.value}`}
                    value={option.value}
                    disabled={option.value === targetLang}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center sm:w-14">
              <button
                type="button"
                onClick={swapLanguages}
                className="my-1 flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] sm:my-0"
                aria-label="Swap languages"
              >
                <span className="sm:hidden">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3 5 6.99h3V14h2V6.99h3L9 3z" />
                  </svg>
                </span>
                <span className="hidden sm:inline">
                  <SwapIcon />
                </span>
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 sm:px-4">
              <select
                value={targetLang}
                onChange={(event) => handleTargetChange(event.target.value)}
                className="w-full min-w-0 cursor-pointer appearance-none bg-transparent py-2 text-sm font-medium text-[#3c4043] outline-none sm:text-[15px]"
                aria-label="Target language"
              >
                {targetOptions.map((option) => (
                  <option
                    key={`target-${option.value}`}
                    value={option.value}
                    disabled={option.value === sourceLang}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translation panels */}
          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
            {/* Input panel */}
            <div className="relative flex min-h-0 flex-col border-b border-[#dadce0] md:border-b-0 md:border-r">
              <textarea
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder={`Enter text (${getLangLabel(sourceLang)})`}
                className="min-h-0 flex-1 resize-none overflow-y-auto bg-transparent px-4 py-4 text-base leading-relaxed text-[#202124] outline-none placeholder:text-[#9aa0a6] md:text-[24px] md:leading-[32px]"
                spellCheck={sourceLang === SOURCE_REAL}
                maxLength={5000}
              />
              <div className="flex shrink-0 items-center justify-between px-3 py-2 text-xs text-[#5f6368]">
                <span>{inputText.length} / 5000</span>
                {inputText ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      setOutputText("");
                      setUnknownWords([]);
                      setError("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
                    aria-label="Clear text"
                  >
                    <ClearIcon />
                  </button>
                ) : (
                  <span className="h-8 w-8" />
                )}
              </div>
            </div>

            {/* Output panel */}
            <div className="relative flex min-h-0 flex-col bg-[#f8f9fa]">
              <div
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-base leading-relaxed text-[#202124] md:text-[24px] md:leading-[32px]"
                aria-live="polite"
              >
                {loading ? (
                  <span className="text-[#5f6368]">Translating…</span>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="text-[#9aa0a6]">
                    {getLangLabel(targetLang)}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center justify-between px-3 py-2 text-xs text-[#5f6368]">
                <span>
                  {unknownWords.length > 0
                    ? `Unknown: ${unknownWords.join(", ")}`
                    : outputText
                      ? "Translation"
                      : ""}
                </span>
                {outputText ? (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(outputText)}
                    className="rounded px-2 py-1 text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe]"
                  >
                    Copy
                  </button>
                ) : (
                  <span className="h-6" />
                )}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {selectedLanguage?.description ? (
          <p className="mt-4 shrink-0 text-center text-sm text-[#5f6368]">
            {selectedLanguage.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
