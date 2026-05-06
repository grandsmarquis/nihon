import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { jlptLevels } from "@/lib/grammar-types";
import type { JLPTLevel } from "@/lib/grammar-types";

export { jlptLevels };
export type { JLPTLevel };

const grammarExampleSchema = z.object({
  japanese: z.string().min(1),
  reading: z.string().min(1),
  english: z.string().min(1),
  note: z.string().optional(),
});

const grammarFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Use lowercase URL-safe slugs, such as tai-form.",
    }),
  level: z.enum(jlptLevels),
  tags: z.array(z.string().min(1)).default([]),
  order: z.number().int().nonnegative(),
  summary: z.string().min(1),
  examples: z.array(grammarExampleSchema).min(1),
});

export type GrammarExample = z.infer<typeof grammarExampleSchema>;

export type GrammarPoint = z.infer<typeof grammarFrontmatterSchema> & {
  content: string;
  filePath: string;
};

export type GrammarPointSummary = Omit<GrammarPoint, "content" | "filePath"> & {
  searchText: string;
};

const grammarDirectory = path.join(process.cwd(), "content", "grammar");

function parseGrammarFile(fileName: string): GrammarPoint {
  const filePath = path.join(grammarDirectory, fileName);
  const rawFile = fs.readFileSync(filePath, "utf8");
  const parsed = matter(rawFile);
  const validation = grammarFrontmatterSchema.safeParse(parsed.data);

  if (!validation.success) {
    const issues = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid grammar metadata in ${filePath}: ${issues}`);
  }

  if (!parsed.content.trim()) {
    throw new Error(`Grammar file ${filePath} must include markdown body content.`);
  }

  return {
    ...validation.data,
    content: parsed.content.trim(),
    filePath,
  };
}

function toSummary(grammarPoint: GrammarPoint): GrammarPointSummary {
  const searchableExamples = grammarPoint.examples
    .map((example) =>
      [example.japanese, example.reading, example.english, example.note]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");

  return {
    title: grammarPoint.title,
    slug: grammarPoint.slug,
    level: grammarPoint.level,
    tags: grammarPoint.tags,
    order: grammarPoint.order,
    summary: grammarPoint.summary,
    examples: grammarPoint.examples,
    searchText: [
      grammarPoint.title,
      grammarPoint.slug,
      grammarPoint.level,
      grammarPoint.summary,
      grammarPoint.tags.join(" "),
      searchableExamples,
    ].join(" "),
  };
}

export const getGrammarPoints = cache((): GrammarPoint[] => {
  if (!fs.existsSync(grammarDirectory)) {
    return [];
  }

  return fs
    .readdirSync(grammarDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(parseGrammarFile)
    .sort((a, b) => {
      const levelDifference = jlptLevels.indexOf(a.level) - jlptLevels.indexOf(b.level);

      if (levelDifference !== 0) {
        return levelDifference;
      }

      return a.order - b.order || a.title.localeCompare(b.title);
    });
});

export const getGrammarPointSummaries = cache((): GrammarPointSummary[] =>
  getGrammarPoints().map(toSummary),
);

export function getGrammarPointBySlug(slug: string): GrammarPoint | undefined {
  return getGrammarPoints().find((grammarPoint) => grammarPoint.slug === slug);
}
