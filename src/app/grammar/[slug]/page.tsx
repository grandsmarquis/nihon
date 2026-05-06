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
    <main className="ukiyo-page min-h-screen">
      <article className="ukiyo-shell mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">
        <header className="ukiyo-header border-b pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/grammar" className="ukiyo-link font-semibold underline-offset-4 hover:underline">
              Grammar index
            </Link>
            <span className="text-stone-500">/</span>
            <span className="font-medium text-stone-700">{grammarPoint.level}</span>
          </div>

          <h1 className="ukiyo-title mt-6 text-5xl tracking-normal">{grammarPoint.title}</h1>
          <p className="mt-4 text-xl leading-8 text-stone-700">{grammarPoint.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="ukiyo-seal rounded-sm px-2.5 py-1 text-sm font-semibold">
              {grammarPoint.level}
            </span>
            {grammarPoint.tags.map((tag) => (
              <span
                key={tag}
                className="ukiyo-tag rounded-sm px-2.5 py-1 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section className="ukiyo-panel mt-8 rounded-md p-5 md:p-7">
          <h2 className="ukiyo-section-title text-2xl">Examples</h2>
          <div className="mt-5 space-y-4">
            {grammarPoint.examples.map((example) => (
              <div key={`${example.japanese}-${example.english}`} className="ukiyo-quote border-l-2 pl-4">
                <p className="text-2xl font-semibold leading-9 text-stone-950">{example.japanese}</p>
                <p className="mt-1 text-sm text-stone-600">{example.reading}</p>
                <p className="mt-2 text-base leading-7 text-stone-800">{example.english}</p>
                {example.note && <p className="mt-2 text-sm text-stone-600">{example.note}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-content ukiyo-panel mt-8 rounded-md p-5 md:p-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{grammarPoint.content}</ReactMarkdown>
        </section>
      </article>
    </main>
  );
}
