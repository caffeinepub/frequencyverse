import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Clock, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMainPlayer } from '../hooks/useMainPlayer';
import { useVisualization } from '../hooks/useVisualization';
import { useLanguage } from '../hooks/useLanguage';
import { useVisualTheme } from '../hooks/useTheme';
import { kidsSleepSounds } from '../lib/kidsSleepSounds';
import { peacefulSounds } from '../lib/peacefulSounds';
import DurationSelectorPopup from './DurationSelectorPopup';
import PlaylistPopup from './PlaylistPopup';

export default function MainPlayer() {
  const player = useMainPlayer();
  const { setFullScreen } = useVisualization();
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const [isDurationPopupOpen, setIsDurationPopupOpen] = useState(false);
  const [isPlaylistPopupOpen, setIsPlaylistPopupOpen] = useState(false);

  const getCurrentItemName = () => {
    if (player.currentFrequency) {
      return `${player.currentFrequency} Hz`;
    } else if (player.currentSoundId) {
      const kidsSound = kidsSleepSounds.find(s => s.id === player.currentSoundId);
      if (kidsSound) {
        return t.kidsSleepSounds[kidsSound.category][kidsSound.title];
      }
      const peacefulSound = peacefulSounds.find(s => s.id === player.currentSoundId);
      if (peacefulSound) {
        return t.peacefulSounds[peacefulSound.title];
      }
      return player.currentSoundId;
    }
    return 'FrequencyVerse';
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasActiveAudio = player.currentFrequency !== null || player.currentSoundId !== null;
  const canShowFullScreen = hasActiveAudio && player.isPlaying;

  const handleFullScreenToggle = () => {
    if (canShowFullScreen) {
      setFullScreen(true);
    }
  };

  const handleDurationButtonClick = () => {
    setIsDurationPopupOpen(true);
  };

  const handlePlaylistButtonClick = () => {
    setIsPlaylistPopupOpen(true);
  };

  const handleDurationChange = (duration: number) => {
    player.setSelectedDuration(duration);
  };

  // Theme-adaptive gradient backgrounds and glow colors
  const getThemeStyles = () => {
    switch (theme) {
      case 'aurora-glow':
        return {
          gradient: 'from-purple-900/40 via-indigo-900/40 to-blue-900/40',
          glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
          border: 'border-purple-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]',
        };
      case 'celestial-calm':
        return {
          gradient: 'from-indigo-950/40 via-blue-950/40 to-slate-900/40',
          glow: 'shadow-[0_0_30px_rgba(99,102,241,0.3)]',
          border: 'border-indigo-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]',
        };
      case 'sacred-lotus':
        return {
          gradient: 'from-teal-900/40 via-emerald-900/40 to-green-900/40',
          glow: 'shadow-[0_0_30px_rgba(20,184,166,0.3)]',
          border: 'border-teal-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]',
        };
      case 'ethereal-waves':
        return {
          gradient: 'from-violet-900/40 via-fuchsia-900/40 to-pink-900/40',
          glow: 'shadow-[0_0_30px_rgba(192,132,252,0.3)]',
          border: 'border-violet-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(192,132,252,0.5)]',
        };
      case 'zen-garden':
        return {
          gradient: 'from-slate-800/40 via-gray-800/40 to-stone-800/40',
          glow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]',
          border: 'border-slate-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(148,163,184,0.5)]',
        };
      default:
        return {
          gradient: 'from-purple-900/40 via-indigo-900/40 to-blue-900/40',
          glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
          border: 'border-purple-500/30',
          buttonGlow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]',
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${themeStyles.gradient} backdrop-blur-xl border-t ${themeStyles.border} ${themeStyles.glow} z-50 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto">
          {/* Player Controls - Mobile-optimized mystical theme-adaptive design */}
          <div className="px-3 sm:px-4 py-3">
            <div className="flex flex-col gap-3">
              {/* Current Item Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="text-white font-semibold text-sm sm:text-base truncate drop-shadow-lg">{getCurrentItemName()}</div>
                {player.sessionName && (
                  <div className="text-white/70 text-xs sm:text-sm truncate drop-shadow-md">{player.sessionName}</div>
                )}
                {player.timeRemaining > 0 && (
                  <div className="text-white/70 text-xs sm:text-sm drop-shadow-md">
                    {formatTime(player.timeRemaining)} {t.timeRemaining || 'remaining'}
                  </div>
                )}
              </div>

              {/* Playback Controls - Mobile-optimized compact row with all controls */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                {/* Secondary controls row for mobile */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={player.toggleShuffle}
                    className={`${player.shuffleEnabled ? 'text-green-400' : 'text-white/70'} ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 hover:text-white min-h-[44px] min-w-[44px]`}
                    title={t.shuffle || 'Shuffle'}
                  >
                    <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={player.previous}
                    disabled={player.queue.length <= 1}
                    className={`text-white/80 hover:text-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 min-h-[44px] min-w-[44px]`}
                    title={t.previous || 'Previous'}
                  >
                    <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Main play/pause button */}
                {player.isPlaying ? (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={player.pause}
                    className={`h-12 w-12 sm:h-14 sm:w-14 bg-white/95 text-black hover:bg-white ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95`}
                    title={t.pause || 'Pause'}
                  >
                    <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={player.resume}
                    disabled={!player.isPaused}
                    className={`h-12 w-12 sm:h-14 sm:w-14 bg-white/95 text-black hover:bg-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95`}
                    title={t.play}
                  >
                    <Play className="h-6 w-6 sm:h-7 sm:w-7" />
                  </Button>
                )}

                {/* Secondary controls continued */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={player.next}
                    disabled={player.queue.length <= 1}
                    className={`text-white/80 hover:text-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 min-h-[44px] min-w-[44px]`}
                    title={t.next || 'Next'}
                  >
                    <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={player.toggleRepeat}
                    className={`${player.repeatMode !== 'off' ? 'text-green-400' : 'text-white/70'} ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 hover:text-white min-h-[44px] min-w-[44px]`}
                    title={t.repeat || 'Repeat'}
                  >
                    <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Duration Button - Mobile optimized */}
                <Button
                  variant="ghost"
                  onClick={handleDurationButtonClick}
                  className={`flex items-center gap-1 sm:gap-2 text-white/80 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 px-2 sm:px-3 py-2 min-h-[44px]`}
                  title={t.sessions?.currentDuration || 'Duration'}
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{player.selectedDuration} {t.durationUnit}</span>
                </Button>

                {/* Playlist Icon - Mobile optimized */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlaylistButtonClick}
                  className={`text-white/80 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 min-h-[44px] min-w-[44px]`}
                  title={t.playlist.title}
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                {/* Full Screen Toggle - Mobile optimized */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullScreenToggle}
                  disabled={!canShowFullScreen}
                  className={`text-white/80 hover:text-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 active:scale-95 min-h-[44px] min-w-[44px]`}
                  title={t.visualizationToggle || 'Visualization'}
                >
                  <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                {/* Volume Control - Hidden on mobile, shown on larger screens */}
                <div className="hidden lg:flex items-center gap-2 ml-2">
                  <Volume2 className="h-5 w-5 text-white/70 flex-shrink-0" />
                  <Slider
                    defaultValue={[70]}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Selector Popup */}
      <DurationSelectorPopup
        isOpen={isDurationPopupOpen}
        onClose={() => setIsDurationPopupOpen(false)}
        currentDuration={player.selectedDuration}
        onDurationChange={handleDurationChange}
      />

      {/* Playlist Popup */}
      <PlaylistPopup
        isOpen={isPlaylistPopupOpen}
        onClose={() => setIsPlaylistPopupOpen(false)}
      />
    </>
  );
}
