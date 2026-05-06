import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { jlptLevels } from "@/lib/grammar-types";
import type { JLPTLevel } from "@/lib/grammar-types";

const slugSchema = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const conversationTurnSchema = z.object({
  speaker: z.string().min(1),
  japanese: z.string().min(1),
  reading: z.string().min(1),
  english: z.string().min(1),
  grammarSlugs: z.array(slugSchema).default([]),
});

const conversationImageSchema = z.object({
  src: z.string().min(1).regex(/^\/.+/, {
    message: "Image paths should start with / and point to public assets.",
  }),
  alt: z.string().min(1),
});

const conversationFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  level: z.enum(jlptLevels),
  situation: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  order: z.number().int().nonnegative(),
  summary: z.string().min(1),
  image: conversationImageSchema.optional(),
  grammarSlugs: z.array(slugSchema).min(1),
  turns: z.array(conversationTurnSchema).min(2),
});

export type ConversationTurn = z.infer<typeof conversationTurnSchema>;

export type Conversation = z.infer<typeof conversationFrontmatterSchema> & {
  content: string;
  filePath: string;
};

export type ConversationSummary = Omit<Conversation, "content" | "filePath" | "turns"> & {
  searchText: string;
  turnCount: number;
};

const conversationsDirectory = path.join(process.cwd(), "content", "conversations");

function parseConversationFile(fileName: string): Conversation {
  const filePath = path.join(conversationsDirectory, fileName);
  const rawFile = fs.readFileSync(filePath, "utf8");
  const parsed = matter(rawFile);
  const validation = conversationFrontmatterSchema.safeParse(parsed.data);

  if (!validation.success) {
    const issues = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid conversation metadata in ${filePath}: ${issues}`);
  }

  return {
    ...validation.data,
    content: parsed.content.trim(),
    filePath,
  };
}

function toSummary(conversation: Conversation): ConversationSummary {
  const searchableTurns = conversation.turns
    .map((turn) => [turn.speaker, turn.japanese, turn.reading, turn.english].join(" "))
    .join(" ");

  return {
    title: conversation.title,
    slug: conversation.slug,
    level: conversation.level as JLPTLevel,
    situation: conversation.situation,
    tags: conversation.tags,
    order: conversation.order,
    summary: conversation.summary,
    image: conversation.image,
    grammarSlugs: conversation.grammarSlugs,
    turnCount: conversation.turns.length,
    searchText: [
      conversation.title,
      conversation.slug,
      conversation.level,
      conversation.situation,
      conversation.summary,
      conversation.tags.join(" "),
      conversation.grammarSlugs.join(" "),
      conversation.image?.alt,
      searchableTurns,
    ].join(" "),
  };
}

export const getConversations = cache((): Conversation[] => {
  if (!fs.existsSync(conversationsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(conversationsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(parseConversationFile)
    .sort((a, b) => {
      const levelDifference = jlptLevels.indexOf(a.level) - jlptLevels.indexOf(b.level);

      if (levelDifference !== 0) {
        return levelDifference;
      }

      return a.order - b.order || a.title.localeCompare(b.title);
    });
});

export const getConversationSummaries = cache((): ConversationSummary[] =>
  getConversations().map(toSummary),
);

export function getConversationBySlug(slug: string): Conversation | undefined {
  return getConversations().find((conversation) => conversation.slug === slug);
}
