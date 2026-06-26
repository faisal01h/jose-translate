import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const language = await prisma.language.upsert({
    where: { code: "valdris" },
    update: {},
    create: {
      name: "Valdris",
      code: "valdris",
      description:
        "A melodic constructed language with flowing suffixes and ancient roots.",
      sourceLanguage: "en",
      dictionaryEntries: {
        create: [
          { sourceWord: "hello", targetWord: "ka nu salu", partOfSpeech: "interjection" },
          { sourceWord: "good morning", targetWord: "bonadia", partOfSpeech: "phrase" },
          { sourceWord: "world", targetWord: "mundu", partOfSpeech: "noun" },
          { sourceWord: "love", targetWord: "amari", partOfSpeech: "noun" },
          { sourceWord: "beautiful", targetWord: "bela", partOfSpeech: "adjective" },
          { sourceWord: "water", targetWord: "aqua", partOfSpeech: "noun" },
          { sourceWord: "sky", targetWord: "celu", partOfSpeech: "noun" },
          { sourceWord: "friend", targetWord: "amiku", partOfSpeech: "noun" },
          { sourceWord: "speak", targetWord: "parolu", partOfSpeech: "verb" },
          { sourceWord: "language", targetWord: "lingu", partOfSpeech: "noun" },
          { sourceWord: "good", targetWord: "bona", partOfSpeech: "adjective" },
          { sourceWord: "day", targetWord: "dia", partOfSpeech: "noun" },
          { sourceWord: "night", targetWord: "noxu", partOfSpeech: "noun" },
        ],
      },
      vocabularies: {
        create: [
          {
            word: "salu",
            definition: "A greeting of warmth and recognition.",
            partOfSpeech: "interjection",
            example: "Salu, amiku!",
          },
          {
            word: "mundu",
            definition: "The world or realm of existence.",
            partOfSpeech: "noun",
            example: "La bela mundu.",
          },
        ],
      },
      grammaticalRules: {
        create: [
          {
            name: "Plural suffix",
            description: "Adds -en to plural nouns after translation.",
            ruleType: "REGEX",
            pattern: "\\b(\\w+u)\\b",
            replacement: "$1en",
            priority: 10,
          },
          {
            name: "Sentence flourish",
            description: "Adds a poetic closing marker.",
            ruleType: "SUFFIX",
            pattern: "",
            replacement: " ✦",
            priority: 1,
          },
        ],
      },
      thesaurusEntries: {
        create: [
          { word: "hello", related: "greetings", relation: "RELATED" },
          { word: "beautiful", related: "good", relation: "SYNONYM" },
        ],
      },
    },
  });

  console.log(`Seeded language: ${language.name} (${language.code})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
