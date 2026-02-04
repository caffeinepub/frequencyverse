import { LanguageProvider } from './hooks/useLanguage';
import { VisualThemeProvider } from './hooks/useTheme';
import { VisualizationProvider } from './hooks/useVisualization';
import { MainPlayerProvider } from './hooks/useMainPlayer';
import { BackgroundAmbianceProvider } from './hooks/useBackgroundAmbiance';
import { AudioActivationProvider } from './hooks/useAudioActivation';
import { UnifiedAudioManagerProvider } from './hooks/UnifiedAudioManagerContext';
import AppErrorBoundary from './components/AppErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import UnifiedFrequencyList from './components/UnifiedFrequencyList';
import MainPlayer from './components/MainPlayer';
import ThemeBackground from './components/ThemeBackground';
import PlayerAnimationOverlay from './components/PlayerAnimationOverlay';
import { useVisualization } from './hooks/useVisualization';
import { useMainPlayer } from './hooks/useMainPlayer';
import { useUnifiedAudioManager } from './hooks/useUnifiedAudioManager';

function AppContent() {
  const { isFullScreen, setFullScreen } = useVisualization();
  const player = useMainPlayer();
  const audioManager = useUnifiedAudioManager();

  return (
    <div className="min-h-screen flex flex-col relative">
      <ThemeBackground />
      <Header />
      <main className="flex-1 relative z-10 pb-32">
        <UnifiedFrequencyList />
      </main>
      <MainPlayer />
      <Footer />
      
      {/* Player Animation Overlay */}
      <PlayerAnimationOverlay
        isOpen={isFullScreen}
        onClose={() => setFullScreen(false)}
        currentFrequency={player.currentFrequency}
        currentSoundId={player.currentSoundId}
        visualIntensity={audioManager.intensity}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}
