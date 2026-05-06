"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ConversationSummary } from "@/lib/conversations";
import { jlptLevels, type JLPTLevel } from "@/lib/grammar-types";

type LevelFilter = "All" | JLPTLevel;

type ConversationBrowserProps = {
  conversations: ConversationSummary[];
  grammarTitles?: Record<string, string>;
};

export function ConversationBrowser({
  conversations,
  grammarTitles = {},
}: ConversationBrowserProps) {
  const [level, setLevel] = useState<LevelFilter>("All");

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) => (
        level === "All" || conversation.level === level
      )),
    [conversations, level],
  );

  const levelCounts = useMemo(
    () =>
      jlptLevels.reduce<Record<JLPTLevel, number>>((counts, jlptLevel) => {
        counts[jlptLevel] = conversations.filter(
          (conversation) => conversation.level === jlptLevel,
        ).length;

        return counts;
      }, {} as Record<JLPTLevel, number>),
    [conversations],
  );

  return (
    <section className="space-y-8" aria-label="Conversation browser">
      <div className="ukiyo-panel rounded-md p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="w-full space-y-2 lg:max-w-xs">
            <span className="text-sm font-medium text-stone-800">JLPT level</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as LevelFilter)}
              className="ukiyo-field h-11 w-full rounded-md px-3 text-base outline-none transition"
            >
              <option value="All">All levels</option>
              {jlptLevels.map((jlptLevel) => (
                <option key={jlptLevel} value={jlptLevel}>
                  {jlptLevel}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2" aria-label="Filter conversations by JLPT level">
            {(["All", ...jlptLevels] as LevelFilter[]).map((jlptLevel) => {
              const isActive = level === jlptLevel;
              const count = jlptLevel === "All" ? conversations.length : levelCounts[jlptLevel];

              return (
                <button
                  key={jlptLevel}
                  type="button"
                  onClick={() => setLevel(jlptLevel)}
                  className={`h-9 rounded-md px-3 text-sm font-medium transition ${
                    isActive
                      ? "ukiyo-button-active"
                      : "ukiyo-button"
                  }`}
                >
                  {jlptLevel}
                  <span className={isActive ? "ml-2 text-stone-200" : "ml-2 text-stone-600"}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-stone-700">
        <p>
          Showing {filteredConversations.length} of {conversations.length} conversations
        </p>
        {level !== "All" && (
          <button
            type="button"
            onClick={() => setLevel("All")}
            className="ukiyo-link font-medium underline-offset-4 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {filteredConversations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.slug}
              href={`/conversations/${conversation.slug}`}
              className="ukiyo-card group rounded-md p-5 transition hover:-translate-y-0.5"
            >
              {conversation.image && (
                <div className="ukiyo-image-frame mb-5 overflow-hidden rounded-sm">
                  <Image
                    src={conversation.image.src}
                    alt={conversation.image.alt}
                    width={1672}
                    height={941}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="ukiyo-image aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="ukiyo-section-title text-xl group-hover:underline">
                    {conversation.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{conversation.summary}</p>
                </div>
                <span className="ukiyo-seal rounded-sm px-2 py-1 text-xs font-semibold">
                  {conversation.level}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-stone-800">{conversation.situation}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {conversation.grammarSlugs.slice(0, 5).map((slug) => (
                  <span
                    key={slug}
                    className="ukiyo-tag rounded-sm px-2 py-1 text-xs font-medium"
                  >
                    {grammarTitles[slug] ?? slug}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm font-semibold text-stone-950">
                {conversation.turnCount} turns
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="ukiyo-panel rounded-md border-dashed p-8 text-center">
          <h2 className="ukiyo-section-title text-lg">No conversations found</h2>
          <p className="mt-2 text-sm text-stone-700">Try another JLPT level.</p>
        </div>
      )}
    </section>
  );
}
