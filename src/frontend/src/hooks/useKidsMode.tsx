import { type ReactNode, createContext, useContext, useState } from "react";

interface KidsModeContextType {
  kidsMode: boolean;
  setKidsMode: (v: boolean) => void;
}

const KidsModeContext = createContext<KidsModeContextType | undefined>(
  undefined,
);

export function KidsModeProvider({ children }: { children: ReactNode }) {
  const [kidsMode, setKidsModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fv_kids_mode") === "true";
    } catch {
      return false;
    }
  });

  const setKidsMode = (v: boolean) => {
    setKidsModeState(v);
    try {
      localStorage.setItem("fv_kids_mode", String(v));
    } catch {
      // ignore
    }
  };

  return (
    <KidsModeContext.Provider value={{ kidsMode, setKidsMode }}>
      {children}
    </KidsModeContext.Provider>
  );
}

export function useKidsMode() {
  const ctx = useContext(KidsModeContext);
  if (!ctx) throw new Error("useKidsMode must be within KidsModeProvider");
  return ctx;
}
