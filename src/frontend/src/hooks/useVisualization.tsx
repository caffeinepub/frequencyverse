import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VisualizationContextType {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  setFullScreen: (enabled: boolean) => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

const FULLSCREEN_STORAGE_KEY = 'frequencyverse-visualization-fullscreen';

export function VisualizationProvider({ children }: { children: ReactNode }) {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(() => {
    const stored = localStorage.getItem(FULLSCREEN_STORAGE_KEY);
    return stored === 'true';
  });

  const setFullScreen = (enabled: boolean) => {
    setIsFullScreen(enabled);
    localStorage.setItem(FULLSCREEN_STORAGE_KEY, String(enabled));
  };

  const toggleFullScreen = () => {
    setFullScreen(!isFullScreen);
  };

  return (
    <VisualizationContext.Provider value={{ isFullScreen, toggleFullScreen, setFullScreen }}>
      {children}
    </VisualizationContext.Provider>
  );
}

export function useVisualization() {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
}
