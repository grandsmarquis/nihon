"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nihon.learntConversations.v1";

function readLearntSlugs(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return new Set();
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return new Set();
    }

    return new Set(parsedValue.filter((slug): slug is string => typeof slug === "string"));
  } catch {
    return new Set();
  }
}

function writeLearntSlugs(slugs: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(slugs).sort()));
}

export function useLearntConversations() {
  const [learntSlugs, setLearntSlugs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setLearntSlugs(readLearntSlugs());

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setLearntSlugs(readLearntSlugs());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setConversationLearnt = useCallback((slug: string, learnt: boolean) => {
    setLearntSlugs((currentSlugs) => {
      const nextSlugs = new Set(currentSlugs);

      if (learnt) {
        nextSlugs.add(slug);
      } else {
        nextSlugs.delete(slug);
      }

      writeLearntSlugs(nextSlugs);
      return nextSlugs;
    });
  }, []);

  return {
    learntSlugs,
    isConversationLearnt: useCallback(
      (slug: string) => learntSlugs.has(slug),
      [learntSlugs],
    ),
    setConversationLearnt,
  };
}
