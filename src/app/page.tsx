import Link from "next/link";
import { ConversationBrowser } from "@/components/ConversationBrowser";
import { getConversationSummaries } from "@/lib/conversations";
import { getGrammarPointSummaries } from "@/lib/grammar";

export default function Home() {
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
        <header className="ukiyo-header mb-8 flex flex-col gap-5 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="ukiyo-brand text-sm font-semibold">
              infinihongo
            </Link>
            <h1 className="ukiyo-title mt-5 text-4xl tracking-normal md:text-5xl">
              Conversation examples
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-stone-700">
              Practice natural situations and filter the full conversation library by JLPT level.
            </p>
          </div>
          <Link href="/grammar" className="ukiyo-link text-sm font-semibold underline-offset-4 hover:underline">
            Open grammar index
          </Link>
        </header>

        <ConversationBrowser conversations={conversations} grammarTitles={grammarTitles} />
      </div>
    </main>
  );
}
