"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "nihon.learntConversations.v1";
const STORAGE_CHANGE_EVENT = "nihon:learnt-conversations-change";
const emptySlugs = new Set<string>();

let cachedStoredValue: string | null | undefined;
let cachedSlugs = emptySlugs;

function parseLearntSlugs(storedValue: string | null): Set<string> {
  try {
    if (!storedValue) {
      return emptySlugs;
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return emptySlugs;
    }

    return new Set(parsedValue.filter((slug): slug is string => typeof slug === "string"));
  } catch {
    return emptySlugs;
  }
}

function getLearntSnapshot(): Set<string> {
  if (typeof window === "undefined") {
    return emptySlugs;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (storedValue === cachedStoredValue) {
      return cachedSlugs;
    }

    cachedStoredValue = storedValue;
    cachedSlugs = parseLearntSlugs(storedValue);

    return cachedSlugs;
  } catch {
    return emptySlugs;
  }
}

function subscribeToLearntConversations(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
}

function writeLearntSlugs(slugs: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(slugs).sort()));
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  } catch {
    // Keep the UI usable when storage is unavailable.
  }
}

export function useLearntConversations() {
  const learntSlugs = useSyncExternalStore(
    subscribeToLearntConversations,
    getLearntSnapshot,
    () => emptySlugs,
  );

  const setConversationLearnt = useCallback((slug: string, learnt: boolean) => {
    const nextSlugs = new Set(getLearntSnapshot());

    if (learnt) {
      nextSlugs.add(slug);
    } else {
      nextSlugs.delete(slug);
    }

    writeLearntSlugs(nextSlugs);
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
