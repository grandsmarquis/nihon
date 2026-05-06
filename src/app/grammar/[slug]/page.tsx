import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGrammarPointBySlug, getGrammarPoints } from "@/lib/grammar";

type GrammarPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getGrammarPoints().map((grammarPoint) => ({
    slug: grammarPoint.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: GrammarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const grammarPoint = getGrammarPointBySlug(slug);

  if (!grammarPoint) {
    return {
      title: "Grammar point not found",
    };
  }

  return {
    title: grammarPoint.title,
    description: grammarPoint.summary,
  };
}

export default async function GrammarPointPage({ params }: GrammarPageProps) {
  const { slug } = await params;
  const grammarPoint = getGrammarPointBySlug(slug);

  if (!grammarPoint) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <article className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">
        <header className="border-b border-stone-200 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/grammar" className="font-semibold text-red-800 underline-offset-4 hover:underline">
              Grammar index
            </Link>
            <span className="text-stone-400">/</span>
            <span className="font-medium text-stone-600">{grammarPoint.level}</span>
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-normal text-stone-950">{grammarPoint.title}</h1>
          <p className="mt-4 text-xl leading-8 text-stone-600">{grammarPoint.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-md bg-red-800 px-2.5 py-1 text-sm font-semibold text-white">
              {grammarPoint.level}
            </span>
            {grammarPoint.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-sm font-medium text-stone-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 md:p-7">
          <h2 className="text-2xl font-semibold text-stone-950">Examples</h2>
          <div className="mt-5 space-y-4">
            {grammarPoint.examples.map((example) => (
              <div key={`${example.japanese}-${example.english}`} className="border-l-2 border-red-800 pl-4">
                <p className="text-2xl font-semibold leading-9 text-stone-950">{example.japanese}</p>
                <p className="mt-1 text-sm text-stone-500">{example.reading}</p>
                <p className="mt-2 text-base leading-7 text-stone-700">{example.english}</p>
                {example.note && <p className="mt-2 text-sm text-stone-500">{example.note}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-content mt-8 rounded-lg border border-stone-200 bg-white p-5 md:p-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{grammarPoint.content}</ReactMarkdown>
        </section>
      </article>
    </main>
  );
}
