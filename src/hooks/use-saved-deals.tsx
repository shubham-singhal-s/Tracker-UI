import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "savedDeals";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persist(deals: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

interface SavedDealsState {
  deals: string[];
  addDeal: (term: string) => void;
  removeDeal: (term: string) => void;
  importDeals: (deals: string[]) => void;
}

const SavedDealsContext = createContext<SavedDealsState | null>(null);

export function SavedDealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState(read);

  const addDeal = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setDeals((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      persist(next);
      return next;
    });
  };

  const removeDeal = (term: string) => {
    setDeals((prev) => {
      const next = prev.filter((d) => d !== term);
      persist(next);
      return next;
    });
  };

  const importDeals = (incoming: string[]) => {
    setDeals(() => {
      persist(incoming);
      return incoming;
    });
  };

  return (
    <SavedDealsContext.Provider value={{ deals, addDeal, removeDeal, importDeals }}>
      {children}
    </SavedDealsContext.Provider>
  );
}

export function useSavedDeals() {
  const ctx = useContext(SavedDealsContext);
  if (!ctx) {
    throw new Error("useSavedDeals must be used within a SavedDealsProvider");
  }
  return ctx;
}
