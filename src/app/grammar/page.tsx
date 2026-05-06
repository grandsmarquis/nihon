import type { Metadata } from "next";
import Link from "next/link";
import { GrammarBrowser } from "@/components/GrammarBrowser";
import { getGrammarPointSummaries } from "@/lib/grammar";

export const metadata: Metadata = {
  title: "Grammar Index",
  description: "Search and filter Japanese grammar points by JLPT level and tag.",
};

export default function GrammarIndexPage() {
  const grammarPoints = getGrammarPointSummaries();

  return (
    <main className="ukiyo-page min-h-screen">
      <div className="ukiyo-shell mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <header className="ukiyo-header mb-8 border-b pb-8">
          <Link href="/" className="ukiyo-brand text-sm font-semibold">
            infinihongo
          </Link>
          <h1 className="ukiyo-title mt-5 text-4xl tracking-normal md:text-5xl">Grammar index</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-stone-700">
            Search every grammar title, summary, tag, and example sentence from the markdown content library.
          </p>
        </header>

        <GrammarBrowser grammarPoints={grammarPoints} />
      </div>
    </main>
  );
}
