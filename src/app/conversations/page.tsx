import type { Metadata } from "next";
import Link from "next/link";
import { ConversationBrowser } from "@/components/ConversationBrowser";
import { getConversationSummaries } from "@/lib/conversations";
import { getGrammarPointSummaries } from "@/lib/grammar";

export const metadata: Metadata = {
  title: "Conversation Examples",
  description: "Japanese conversation examples linked to grammar points.",
};

export default function ConversationsPage() {
  const conversations = getConversationSummaries();
  const grammarTitles = Object.fromEntries(
    getGrammarPointSummaries().map((grammarPoint) => [
      grammarPoint.slug,
      grammarPoint.title,
    ]),
  );

  return (
    <main className="ukiyo-page min-h-screen">
      <div className="ukiyo-shell mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <header className="ukiyo-header mb-8 border-b pb-8">
          <Link href="/" className="ukiyo-brand text-sm font-semibold">
            infinihongo
          </Link>
          <h1 className="ukiyo-title mt-5 text-4xl tracking-normal md:text-5xl">Conversation examples</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-stone-700">
            Practice natural situations and jump directly from each conversation to the grammar it uses.
          </p>
        </header>

        <ConversationBrowser conversations={conversations} grammarTitles={grammarTitles} />
      </div>
    </main>
  );
}
