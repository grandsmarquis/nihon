"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GrammarPointSummary } from "@/lib/grammar";
import { jlptLevels, type JLPTLevel } from "@/lib/grammar-types";

type LevelFilter = "All" | JLPTLevel;

type GrammarBrowserProps = {
  grammarPoints: GrammarPointSummary[];
};

export function GrammarBrowser({ grammarPoints }: GrammarBrowserProps) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("All");
  const [tag, setTag] = useState("All");

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(grammarPoints.flatMap((point) => point.tags))).sort()],
    [grammarPoints],
  );

  const filteredGrammarPoints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return grammarPoints.filter((point) => {
      const matchesLevel = level === "All" || point.level === level;
      const matchesTag = tag === "All" || point.tags.includes(tag);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        point.searchText.toLowerCase().includes(normalizedQuery);

      return matchesLevel && matchesTag && matchesQuery;
    });
  }, [grammarPoints, level, query, tag]);

  const groupedGrammarPoints = jlptLevels
    .map((jlptLevel) => ({
      level: jlptLevel,
      points: filteredGrammarPoints.filter((point) => point.level === jlptLevel),
    }))
    .filter((group) => group.points.length > 0);

  return (
    <section className="space-y-8" aria-label="Grammar browser">
      <div className="ukiyo-panel rounded-md p-4">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-800">Search grammar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try particles, want, です, or N5"
              className="ukiyo-field h-11 w-full rounded-md px-3 text-base outline-none transition"
            />
          </label>

          <label className="space-y-2">
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

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-800">Tag</span>
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="ukiyo-field h-11 w-full rounded-md px-3 text-base outline-none transition"
            >
              {tags.map((tagName) => (
                <option key={tagName} value={tagName}>
                  {tagName === "All" ? "All tags" : tagName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["All", ...jlptLevels] as LevelFilter[]).map((jlptLevel) => {
            const isActive = level === jlptLevel;

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
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-stone-700">
        <p>
          Showing {filteredGrammarPoints.length} of {grammarPoints.length} grammar points
        </p>
        {(query || level !== "All" || tag !== "All") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLevel("All");
              setTag("All");
            }}
            className="ukiyo-link font-medium underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {groupedGrammarPoints.length > 0 ? (
        <div className="space-y-10">
          {groupedGrammarPoints.map((group) => (
            <section key={group.level} className="space-y-4" aria-labelledby={`${group.level}-heading`}>
              <div className="ukiyo-rule flex items-end justify-between border-b pb-2">
                <h2 id={`${group.level}-heading`} className="ukiyo-section-title text-2xl">
                  {group.level}
                </h2>
                <span className="text-sm text-stone-600">
                  {group.points.length} {group.points.length === 1 ? "point" : "points"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.points.map((point) => (
                  <Link
                    key={point.slug}
                    href={`/grammar/${point.slug}`}
                    className="ukiyo-card group rounded-md p-5 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="ukiyo-section-title text-xl group-hover:underline">
                          {point.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-stone-700">{point.summary}</p>
                      </div>
                      <span className="ukiyo-seal rounded-sm px-2 py-1 text-xs font-semibold">
                        {point.level}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {point.tags.map((tagName) => (
                        <span
                          key={tagName}
                          className="ukiyo-tag rounded-sm px-2 py-1 text-xs font-medium"
                        >
                          {tagName}
                        </span>
                      ))}
                    </div>

                    <p className="ukiyo-quote mt-5 border-l-2 pl-3 text-sm leading-6 text-stone-800">
                      {point.examples[0]?.japanese}
                      <span className="block text-stone-600">{point.examples[0]?.english}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="ukiyo-panel rounded-md border-dashed p-8 text-center">
          <h2 className="ukiyo-section-title text-lg">No grammar points found</h2>
          <p className="mt-2 text-sm text-stone-700">Try another search term, JLPT level, or tag.</p>
        </div>
      )}
    </section>
  );
}
