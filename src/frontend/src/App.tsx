import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './hooks/useLanguage';
import { VisualThemeProvider } from './hooks/useTheme';
import { VisualizationProvider, useVisualization } from './hooks/useVisualization';
import { MainPlayerProvider, useMainPlayer } from './hooks/useMainPlayer';
import { BackgroundAmbianceProvider } from './hooks/useBackgroundAmbiance';
import { AudioActivationProvider } from './hooks/useAudioActivation';
import { UnifiedAudioManagerProvider, useUnifiedAudioManagerContext } from './hooks/UnifiedAudioManagerContext';
import { useMainPlayerAudioSync } from './hooks/useMainPlayerAudioSync';
import Header from './components/Header';
import Footer from './components/Footer';
import UnifiedFrequencyList from './components/UnifiedFrequencyList';
import MainPlayer from './components/MainPlayer';
import ThemeBackground from './components/ThemeBackground';
import SoundWaveVisualization from './components/SoundWaveVisualization';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isFullScreen, setFullScreen } = useVisualization();
  const player = useMainPlayer();
  const { intensity } = useUnifiedAudioManagerContext();
  
  // Sync MainPlayer state to audio manager
  useMainPlayerAudioSync();

  const handleCloseFullScreen = () => {
    setFullScreen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ThemeBackground />
      
      {/* Full-screen visualization only - no embedded visualization in normal mode */}
      {isFullScreen && (
        <SoundWaveVisualization 
          visualIntensity={intensity}
          frequency={player.currentFrequency}
          soundId={player.currentSoundId}
          onClose={handleCloseFullScreen}
        />
      )}
      
      {/* Normal UI - always visible unless in full-screen mode */}
      {!isFullScreen && (
        <>
          <Header />
          <main className="flex-1 relative z-10 pb-32">
            <UnifiedFrequencyList />
          </main>
          <MainPlayer />
          <Footer />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <VisualThemeProvider>
          <AudioActivationProvider>
            <VisualizationProvider>
              <MainPlayerProvider>
                <UnifiedAudioManagerProvider>
                  <BackgroundAmbianceProvider>
                    <AppContent />
                  </BackgroundAmbianceProvider>
                </UnifiedAudioManagerProvider>
              </MainPlayerProvider>
            </VisualizationProvider>
          </AudioActivationProvider>
        </VisualThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
