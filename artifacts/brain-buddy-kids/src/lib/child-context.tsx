import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ChildContextType {
  activeChildId: number | null;
  setActiveChildId: (id: number | null) => void;
  clearActiveChild: () => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const [activeChildId, setActiveChildIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("activeChildId");
    return saved ? parseInt(saved, 10) : null;
  });

  const setActiveChildId = (id: number | null) => {
    setActiveChildIdState(id);
    if (id !== null) {
      localStorage.setItem("activeChildId", id.toString());
    } else {
      localStorage.removeItem("activeChildId");
    }
  };

  const clearActiveChild = () => {
    setActiveChildIdState(null);
    localStorage.removeItem("activeChildId");
  };

  return (
    <ChildContext.Provider value={{ activeChildId, setActiveChildId, clearActiveChild }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChildContext() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error("useChildContext must be used within a ChildProvider");
  }
  return context;
}
