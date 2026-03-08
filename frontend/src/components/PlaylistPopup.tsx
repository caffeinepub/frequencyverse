import { useEffect, useRef } from 'react';
import { X, Play, Trash2, ChevronUp, ChevronDown, Shuffle as ShuffleIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../hooks/useLanguage';
import { useVisualTheme } from '../hooks/useTheme';
import { useMainPlayer } from '../hooks/useMainPlayer';
import { kidsSleepSounds } from '../lib/kidsSleepSounds';
import { peacefulSounds } from '../lib/peacefulSounds';

interface PlaylistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistPopup({ isOpen, onClose }: PlaylistPopupProps) {
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const player = useMainPlayer();
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case 'aurora-glow':
        return {
          gradient: 'from-purple-900/95 via-indigo-900/95 to-blue-900/95',
          glow: 'shadow-[0_0_40px_rgba(139,92,246,0.4)]',
          border: 'border-purple-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]',
        };
      case 'celestial-calm':
        return {
          gradient: 'from-indigo-950/95 via-blue-950/95 to-slate-900/95',
          glow: 'shadow-[0_0_40px_rgba(99,102,241,0.4)]',
          border: 'border-indigo-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]',
        };
      case 'sacred-lotus':
        return {
          gradient: 'from-teal-900/95 via-emerald-900/95 to-green-900/95',
          glow: 'shadow-[0_0_40px_rgba(20,184,166,0.4)]',
          border: 'border-teal-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(20,184,166,0.6)]',
        };
      case 'ethereal-waves':
        return {
          gradient: 'from-violet-900/95 via-fuchsia-900/95 to-pink-900/95',
          glow: 'shadow-[0_0_40px_rgba(192,132,252,0.4)]',
          border: 'border-violet-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.6)]',
        };
      case 'zen-garden':
        return {
          gradient: 'from-slate-800/95 via-gray-800/95 to-stone-800/95',
          glow: 'shadow-[0_0_40px_rgba(148,163,184,0.4)]',
          border: 'border-slate-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(148,163,184,0.6)]',
        };
      default:
        return {
          gradient: 'from-purple-900/95 via-indigo-900/95 to-blue-900/95',
          glow: 'shadow-[0_0_40px_rgba(139,92,246,0.4)]',
          border: 'border-purple-500/40',
          buttonGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]',
        };
    }
  };

  const themeStyles = getThemeStyles();

  const getItemName = (item: { type: 'frequency'; id: number } | { type: 'sound'; id: string }) => {
    if (item.type === 'frequency') {
      return `${item.id} Hz`;
    } else {
      const kidsSound = kidsSleepSounds.find(s => s.id === item.id);
      if (kidsSound) {
        return t.kidsSleepSounds[kidsSound.category][kidsSound.title];
      }
      const peacefulSound = peacefulSounds.find(s => s.id === item.id);
      if (peacefulSound) {
        return t.peacefulSounds[peacefulSound.title];
      }
      return item.id;
    }
  };

  const getItemType = (item: { type: 'frequency'; id: number } | { type: 'sound'; id: string }) => {
    if (item.type === 'frequency') {
      return t.playlist.frequency;
    } else {
      const kidsSound = kidsSleepSounds.find(s => s.id === item.id);
      if (kidsSound) {
        return t.playlist.kidsSound;
      }
      return t.playlist.peacefulSound;
    }
  };

  const getItemDescription = (item: { type: 'frequency'; id: number } | { type: 'sound'; id: string }) => {
    if (item.type === 'frequency') {
      return t.frequencies[item.id] || '';
    }
    return '';
  };

  const handlePlayItem = (index: number) => {
    player.updateCurrentIndex(index);
    if (!player.isPlaying) {
      player.resume();
    }
  };

  const handleRemoveItem = (index: number) => {
    const newQueue = [...player.queue];
    newQueue.splice(index, 1);
    if (newQueue.length > 0) {
      const currentItem = newQueue[Math.min(player.currentIndex, newQueue.length - 1)];
      player.playQueue(newQueue, player.playMode, player.sessionName);
      if (player.currentIndex >= index && player.currentIndex > 0) {
        player.updateCurrentIndex(player.currentIndex - 1);
      }
    } else {
      player.stop();
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...player.queue];
    [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
    player.playQueue(newQueue, player.playMode, player.sessionName);
    if (player.currentIndex === index) {
      player.updateCurrentIndex(index - 1);
    } else if (player.currentIndex === index - 1) {
      player.updateCurrentIndex(index);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === player.queue.length - 1) return;
    const newQueue = [...player.queue];
    [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    player.playQueue(newQueue, player.playMode, player.sessionName);
    if (player.currentIndex === index) {
      player.updateCurrentIndex(index + 1);
    } else if (player.currentIndex === index + 1) {
      player.updateCurrentIndex(index);
    }
  };

  const handleStartPlaylist = () => {
    if (player.queue.length > 0) {
      player.updateCurrentIndex(0);
      player.resume();
    }
  };

  const handleShufflePlaylist = () => {
    const newQueue = [...player.queue];
    for (let i = newQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
    }
    player.playQueue(newQueue, player.playMode, player.sessionName);
    player.updateCurrentIndex(0);
  };

  const handleClearPlaylist = () => {
    player.stop();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={popupRef}
        className={`relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-gradient-to-br ${themeStyles.gradient} backdrop-blur-xl border ${themeStyles.border} ${themeStyles.glow} rounded-2xl overflow-hidden transition-all duration-500`}
      >
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <List className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">{t.playlist.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`text-white/80 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Content - Mobile optimized scrolling */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-180px)] sm:max-h-[calc(80vh-200px)]">
          {player.queue.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <List className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-3 sm:mb-4" />
              <p className="text-white/70 text-base sm:text-lg">{t.playlist.empty}</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {player.queue.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  className={`p-3 sm:p-4 rounded-xl border ${
                    player.currentIndex === index
                      ? 'bg-white/20 border-white/40'
                      : 'bg-white/5 border-white/10'
                  } ${themeStyles.buttonGlow} transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/50 text-xs sm:text-sm font-medium">#{index + 1}</span>
                        <span className="text-white/60 text-xs px-2 py-0.5 bg-white/10 rounded-full">
                          {getItemType(item)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-sm sm:text-lg mb-1 truncate">
                        {getItemName(item)}
                      </h3>
                      {getItemDescription(item) && (
                        <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
                          {getItemDescription(item)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayItem(index)}
                        className={`text-white/80 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
                        title={t.play}
                      >
                        <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className={`text-white/80 hover:text-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
                        title={t.playlist.moveUp}
                      >
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === player.queue.length - 1}
                        className={`text-white/80 hover:text-white disabled:opacity-30 ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
                        title={t.playlist.moveDown}
                      >
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className={`text-red-400 hover:text-red-300 ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
                        title={t.playlist.remove}
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls - Mobile optimized */}
        {player.queue.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <Button
                onClick={handleStartPlaylist}
                className={`bg-white/95 text-black hover:bg-white ${themeStyles.buttonGlow} transition-all duration-300 px-4 sm:px-6 min-h-[44px] text-sm sm:text-base`}
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t.playlist.startPlaylist}
              </Button>
              <Button
                onClick={handleShufflePlaylist}
                variant="outline"
                className={`border-white/30 text-white hover:bg-white/10 ${themeStyles.buttonGlow} transition-all duration-300 px-4 sm:px-6 min-h-[44px] text-sm sm:text-base`}
              >
                <ShuffleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t.playlist.shufflePlaylist}
              </Button>
              <Button
                onClick={handleClearPlaylist}
                variant="outline"
                className={`border-red-400/30 text-red-400 hover:bg-red-400/10 ${themeStyles.buttonGlow} transition-all duration-300 px-4 sm:px-6 min-h-[44px] text-sm sm:text-base`}
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t.playlist.clearPlaylist}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
