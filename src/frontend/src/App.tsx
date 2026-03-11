import AppErrorBoundary from "./components/AppErrorBoundary";
import BackgroundAmbianceCleanup from "./components/BackgroundAmbianceCleanup";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MainPlayer from "./components/MainPlayer";
import PlayerAnimationOverlay from "./components/PlayerAnimationOverlay";
import ThemeBackground from "./components/ThemeBackground";
import UnifiedFrequencyList from "./components/UnifiedFrequencyList";
import { UnifiedAudioManagerProvider } from "./hooks/UnifiedAudioManagerContext";
import {
  AnimationSettingsProvider,
  useAnimationSettings,
} from "./hooks/useAnimationSettings";
import { AudioActivationProvider } from "./hooks/useAudioActivation";
import { KidsModeProvider } from "./hooks/useKidsMode";
import { LanguageProvider } from "./hooks/useLanguage";
import { MainPlayerProvider } from "./hooks/useMainPlayer";
import { useMainPlayer } from "./hooks/useMainPlayer";
import { VisualThemeProvider } from "./hooks/useTheme";
import { useUnifiedAudioManager } from "./hooks/useUnifiedAudioManager";
import { VisualizationProvider } from "./hooks/useVisualization";
import { useVisualization } from "./hooks/useVisualization";

function AppContent() {
  const { isFullScreen, setFullScreen } = useVisualization();
  const player = useMainPlayer();
  const audioManager = useUnifiedAudioManager();
  const { animationIntensity } = useAnimationSettings();

  return (
    <div className="min-h-screen flex flex-col relative">
      <ThemeBackground />
      <BackgroundAmbianceCleanup />
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
        animationIntensity={animationIntensity}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AnimationSettingsProvider>
          <KidsModeProvider>
            <VisualThemeProvider>
              <AudioActivationProvider>
                <VisualizationProvider>
                  <MainPlayerProvider>
                    <UnifiedAudioManagerProvider>
                      <AppContent />
                    </UnifiedAudioManagerProvider>
                  </MainPlayerProvider>
                </VisualizationProvider>
              </AudioActivationProvider>
            </VisualThemeProvider>
          </KidsModeProvider>
        </AnimationSettingsProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
