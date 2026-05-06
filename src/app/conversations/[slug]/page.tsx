import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getConversationBySlug, getConversations } from "@/lib/conversations";
import { getGrammarPointBySlug } from "@/lib/grammar";

const speakerPalettes = [
  {
    container: "border-red-700 bg-red-50/70",
    name: "text-red-950",
    meta: "text-red-700",
    marker: "bg-red-700",
  },
  {
    container: "border-sky-700 bg-sky-50/80",
    name: "text-sky-950",
    meta: "text-sky-700",
    marker: "bg-sky-700",
  },
  {
    container: "border-emerald-700 bg-emerald-50/80",
    name: "text-emerald-950",
    meta: "text-emerald-700",
    marker: "bg-emerald-700",
  },
  {
    container: "border-amber-700 bg-amber-50/80",
    name: "text-amber-950",
    meta: "text-amber-700",
    marker: "bg-amber-700",
  },
];

type ConversationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getConversations().map((conversation) => ({
    slug: conversation.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ConversationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const conversation = getConversationBySlug(slug);

  if (!conversation) {
    return {
      title: "Conversation not found",
    };
  }

  return {
    title: conversation.title,
    description: conversation.summary,
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { slug } = await params;
  const conversation = getConversationBySlug(slug);

  if (!conversation) {
    notFound();
  }

  const linkedGrammarPoints = conversation.grammarSlugs.map((grammarSlug) => ({
    slug: grammarSlug,
    grammarPoint: getGrammarPointBySlug(grammarSlug),
  }));
  const speakerNames = Array.from(new Set(conversation.turns.map((turn) => turn.speaker)));

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <article className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <header className="border-b border-stone-200 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/conversations" className="font-semibold text-red-800 underline-offset-4 hover:underline">
              Conversation examples
            </Link>
            <span className="text-stone-400">/</span>
            <span className="font-medium text-stone-600">{conversation.level}</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-stone-950 md:text-5xl">
            {conversation.title}
          </h1>
          <p className="mt-4 text-xl leading-8 text-stone-600">{conversation.summary}</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">{conversation.situation}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-md bg-red-800 px-2.5 py-1 text-sm font-semibold text-white">
              {conversation.level}
            </span>
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-sm font-medium text-stone-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {conversation.image && (
            <div className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white">
              <Image
                src={conversation.image.src}
                alt={conversation.image.alt}
                width={1672}
                height={941}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}
        </header>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 md:p-7">
          <h2 className="text-2xl font-semibold text-stone-950">Conversation</h2>
          <div className="mt-6 space-y-5">
            {conversation.turns.map((turn, index) => {
              const palette =
                speakerPalettes[
                  speakerNames.indexOf(turn.speaker) % speakerPalettes.length
                ];

              return (
                <div
                  key={`${turn.speaker}-${index}`}
                  className={`grid gap-3 rounded-lg border-l-4 p-4 md:grid-cols-[8rem_1fr] ${palette.container}`}
                >
                  <div className="flex gap-3 md:block">
                    <span className={`mt-1 h-3 w-3 shrink-0 rounded-full md:mb-3 md:block ${palette.marker}`} />
                    <div>
                      <p className={`text-sm font-semibold ${palette.name}`}>{turn.speaker}</p>
                      <p className={`text-xs ${palette.meta}`}>Line {index + 1}</p>
                    </div>
                  </div>
                  <div
                    className="group/line rounded-md outline-none"
                    tabIndex={0}
                    aria-label={`${turn.reading}. ${turn.english}`}
                  >
                    <p className="text-3xl font-semibold leading-10 text-stone-950 md:text-4xl">
                      {turn.reading}
                    </p>
                    <p className="mt-2 text-base leading-7 text-stone-600">{turn.japanese}</p>
                    <p className="mt-2 max-h-0 overflow-hidden text-base leading-7 text-stone-700 opacity-0 transition-all duration-200 group-hover/line:max-h-24 group-hover/line:opacity-100 group-focus/line:max-h-24 group-focus/line:opacity-100">
                      {turn.english}
                    </p>
                    {turn.grammarSlugs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {turn.grammarSlugs.map((grammarSlug) => {
                          const grammarPoint = getGrammarPointBySlug(grammarSlug);

                          return (
                            <Link
                              key={grammarSlug}
                              href={`/grammar/${grammarSlug}`}
                              className="rounded-md border border-stone-200 bg-white/80 px-2 py-1 text-xs font-medium text-red-800 underline-offset-4 hover:border-red-200 hover:underline"
                            >
                              {grammarPoint?.title ?? grammarSlug}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 md:p-7">
          <h2 className="text-2xl font-semibold text-stone-950">Grammar Used</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {linkedGrammarPoints.map(({ slug: grammarSlug, grammarPoint }) => (
              <Link
                key={grammarSlug}
                href={`/grammar/${grammarSlug}`}
                className="rounded-lg border border-stone-200 p-4 transition hover:border-red-200 hover:bg-stone-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-950">
                      {grammarPoint?.title ?? grammarSlug}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {grammarPoint?.summary ?? "Grammar point not found."}
                    </p>
                  </div>
                  {grammarPoint && (
                    <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
                      {grammarPoint.level}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {conversation.content && (
          <section className="lesson-content mt-8 rounded-lg border border-stone-200 bg-white p-5 md:p-7">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{conversation.content}</ReactMarkdown>
          </section>
        )}
      </article>
    </main>
  );
}
