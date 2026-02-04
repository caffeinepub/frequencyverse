import { createContext, useContext, useState, ReactNode } from 'react';

interface VisualizationContextType {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  setFullScreen: (enabled: boolean) => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

const FULLSCREEN_STORAGE_KEY = 'frequencyverse-visualization-fullscreen';

// Safe localStorage access with fallback
function getStoredFullScreen(): boolean {
  try {
    const stored = localStorage.getItem(FULLSCREEN_STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.warn('⚠️ [VISUALIZATION] Failed to read from localStorage:', error);
    return false;
  }
}

function saveFullScreen(enabled: boolean): void {
  try {
    localStorage.setItem(FULLSCREEN_STORAGE_KEY, String(enabled));
  } catch (error) {
    console.warn('⚠️ [VISUALIZATION] Failed to write to localStorage:', error);
  }
}

export function VisualizationProvider({ children }: { children: ReactNode }) {
  const [isFullScreen, setIsFullScreenState] = useState<boolean>(false);

  const setFullScreen = (enabled: boolean) => {
    setIsFullScreenState(enabled);
    if (!enabled) {
      saveFullScreen(false);
    }
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
