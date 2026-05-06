"use client";

import { useLearntConversations } from "@/components/useLearntConversations";

type ConversationLearntControlProps = {
  slug: string;
};

export function ConversationLearntControl({ slug }: ConversationLearntControlProps) {
  const { isConversationLearnt, setConversationLearnt } = useLearntConversations();
  const isLearnt = isConversationLearnt(slug);

  return (
    <section className="ukiyo-panel mt-8 rounded-md p-5 md:p-7" aria-label="Lesson progress">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ukiyo-section-title text-2xl">Lesson progress</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {isLearnt
              ? "This conversation is marked as learnt in this browser."
              : "Mark this conversation as learnt when you are done practicing it."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConversationLearnt(slug, !isLearnt)}
          aria-pressed={isLearnt}
          className={`h-11 shrink-0 rounded-md px-4 text-sm font-semibold transition ${
            isLearnt ? "ukiyo-button-active" : "ukiyo-button"
          }`}
        >
          {isLearnt ? "Learnt" : "Mark as learnt"}
        </button>
      </div>
    </section>
  );
}
