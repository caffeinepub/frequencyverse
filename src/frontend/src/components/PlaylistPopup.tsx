import { Button } from "@/components/ui/button";
import {
  GripVertical,
  List,
  Play,
  Shuffle as ShuffleIcon,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useMainPlayer } from "../hooks/useMainPlayer";
import { useVisualTheme } from "../hooks/useTheme";
import { kidsSleepSounds } from "../lib/kidsSleepSounds";
import { peacefulSounds } from "../lib/peacefulSounds";

interface PlaylistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistPopup({ isOpen, onClose }: PlaylistPopupProps) {
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const player = useMainPlayer();
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filterMode, setFilterMode] = useState<"all" | "frequency" | "sound">(
    "all",
  );

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case "aurora-glow":
        return {
          gradient: "from-purple-900/95 via-indigo-900/95 to-blue-900/95",
          glow: "shadow-[0_0_40px_rgba(139,92,246,0.4)]",
          border: "border-purple-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]",
          dragOver: "border-purple-400/80 bg-purple-500/20",
        };
      case "celestial-calm":
        return {
          gradient: "from-indigo-950/95 via-blue-950/95 to-slate-900/95",
          glow: "shadow-[0_0_40px_rgba(99,102,241,0.4)]",
          border: "border-indigo-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]",
          dragOver: "border-indigo-400/80 bg-indigo-500/20",
        };
      case "sacred-lotus":
        return {
          gradient: "from-teal-900/95 via-emerald-900/95 to-green-900/95",
          glow: "shadow-[0_0_40px_rgba(20,184,166,0.4)]",
          border: "border-teal-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(20,184,166,0.6)]",
          dragOver: "border-teal-400/80 bg-teal-500/20",
        };
      case "ethereal-waves":
        return {
          gradient: "from-violet-900/95 via-fuchsia-900/95 to-pink-900/95",
          glow: "shadow-[0_0_40px_rgba(192,132,252,0.4)]",
          border: "border-violet-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(192,132,252,0.6)]",
          dragOver: "border-violet-400/80 bg-violet-500/20",
        };
      case "zen-garden":
        return {
          gradient: "from-slate-800/95 via-gray-800/95 to-stone-800/95",
          glow: "shadow-[0_0_40px_rgba(148,163,184,0.4)]",
          border: "border-slate-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.5)]",
          dragOver: "border-slate-400/80 bg-slate-500/20",
        };
      default:
        return {
          gradient: "from-purple-900/95 via-indigo-900/95 to-blue-900/95",
          glow: "shadow-[0_0_40px_rgba(139,92,246,0.4)]",
          border: "border-purple-500/40",
          buttonGlow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]",
          dragOver: "border-purple-400/80 bg-purple-500/20",
        };
    }
  };

  const themeStyles = getThemeStyles();

  const getItemName = (
    item: { type: "frequency"; id: number } | { type: "sound"; id: string },
  ) => {
    if (item.type === "frequency") {
      return `${item.id} Hz`;
    }
    const kidsSound = kidsSleepSounds.find((s) => s.id === item.id);
    if (kidsSound) {
      return t.kidsSleepSounds[kidsSound.category][kidsSound.title];
    }
    const peacefulSound = peacefulSounds.find((s) => s.id === item.id);
    if (peacefulSound) {
      return t.peacefulSounds[peacefulSound.title];
    }
    return item.id;
  };

  const getItemType = (
    item: { type: "frequency"; id: number } | { type: "sound"; id: string },
  ) => {
    if (item.type === "frequency") {
      return t.playlist.frequency;
    }
    const kidsSound = kidsSleepSounds.find((s) => s.id === item.id);
    if (kidsSound) {
      return t.playlist.kidsSound;
    }
    return t.playlist.peacefulSound;
  };

  const getItemDescription = (
    item: { type: "frequency"; id: number } | { type: "sound"; id: string },
  ) => {
    if (item.type === "frequency") {
      return t.frequencies[item.id] || "";
    }
    return "";
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
      player.playQueue(newQueue, player.playMode, player.sessionName);
      if (player.currentIndex >= index && player.currentIndex > 0) {
        player.updateCurrentIndex(player.currentIndex - 1);
      }
    } else {
      player.stop();
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

  // --- Drag and Drop handlers ---
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    // Slightly delay to allow browser ghost image to render
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.4";
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number,
  ) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newQueue = [...player.queue];
    const [draggedItem] = newQueue.splice(dragIndex, 1);
    newQueue.splice(dropIndex, 0, draggedItem);

    // Adjust currentIndex after reorder
    let newCurrentIndex = player.currentIndex;
    if (player.currentIndex === dragIndex) {
      newCurrentIndex = dropIndex;
    } else if (
      dragIndex < player.currentIndex &&
      dropIndex >= player.currentIndex
    ) {
      newCurrentIndex = player.currentIndex - 1;
    } else if (
      dragIndex > player.currentIndex &&
      dropIndex <= player.currentIndex
    ) {
      newCurrentIndex = player.currentIndex + 1;
    }

    player.playQueue(newQueue, player.playMode, player.sessionName);
    player.updateCurrentIndex(newCurrentIndex);

    handleDragEnd();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={popupRef}
        className={`relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-gradient-to-br ${themeStyles.gradient} backdrop-blur-xl border ${themeStyles.border} ${themeStyles.glow} rounded-2xl overflow-hidden transition-all duration-500`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <List className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">
              {t.playlist.title}
            </h2>
            {player.queue.length > 0 && (
              <span className="text-white/50 text-sm">
                ({player.queue.length})
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-ocid="playlist.close_button"
            className={`text-white/80 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 min-h-[44px] min-w-[44px]`}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Filter Bar */}
        {player.queue.length > 0 && (
          <div className="px-4 sm:px-6 pb-2 pt-2 flex gap-2 border-b border-white/5">
            {(["all", "frequency", "sound"] as const).map((mode) => {
              const label =
                mode === "all"
                  ? "Tümü"
                  : mode === "frequency"
                    ? "Frekanslar"
                    : "Sesler";
              const isActive = filterMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  data-ocid={`playlist.filter_${mode}.tab`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${isActive ? "bg-white/30 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80"}
                    border border-white/20 min-h-[32px]`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-220px)] sm:max-h-[calc(80vh-240px)]">
          {player.queue.length === 0 ? (
            <div
              className="text-center py-8 sm:py-12"
              data-ocid="playlist.empty_state"
            >
              <List className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-3 sm:mb-4" />
              <p className="text-white/70 text-base sm:text-lg">
                {t.playlist.empty}
              </p>
            </div>
          ) : (
            (() => {
              // Build filtered list with original indices
              const filteredQueue = player.queue
                .map((item, originalIndex) => ({ item, originalIndex }))
                .filter(({ item }) => {
                  if (filterMode === "all") return true;
                  if (filterMode === "frequency")
                    return item.type === "frequency";
                  return item.type === "sound";
                });

              if (filteredQueue.length === 0) {
                return (
                  <div
                    className="text-center py-8 sm:py-12"
                    data-ocid="playlist.empty_state"
                  >
                    <List className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-3 sm:mb-4" />
                    <p className="text-white/70 text-base sm:text-lg">
                      Bu kategoride ses yok
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-2 sm:space-y-3">
                  {player.queue.length > 1 && filterMode === "all" && (
                    <p className="text-white/40 text-xs text-center pb-1">
                      {t.playlist.dragToReorder || "Sıralamak için sürükleyin"}
                    </p>
                  )}
                  {filteredQueue.map(({ item, originalIndex }, filteredPos) => {
                    const index = originalIndex;
                    const isActive = player.currentIndex === index;
                    const isDragging = dragIndex === index;
                    const isDragTarget =
                      dragOverIndex === index && dragIndex !== index;

                    return (
                      <div
                        key={`${item.type}-${item.id}-${index}`}
                        data-ocid={`playlist.item.${filteredPos + 1}`}
                        draggable={filterMode === "all"}
                        onDragStart={
                          filterMode === "all"
                            ? (e) => handleDragStart(e, index)
                            : undefined
                        }
                        onDragEnd={
                          filterMode === "all" ? handleDragEnd : undefined
                        }
                        onDragOver={
                          filterMode === "all"
                            ? (e) => handleDragOver(e, index)
                            : undefined
                        }
                        onDrop={
                          filterMode === "all"
                            ? (e) => handleDrop(e, index)
                            : undefined
                        }
                        className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 select-none
                      ${isActive ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10"}
                      ${isDragTarget ? themeStyles.dragOver : ""}
                      ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                      ${themeStyles.buttonGlow}
                    `}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Drag Handle (only in "all" mode) */}
                          {filterMode === "all" && (
                            <div
                              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 transition-colors touch-none p-1"
                              data-ocid={`playlist.drag_handle.${filteredPos + 1}`}
                            >
                              <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                          )}

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-white/50 text-xs font-medium">
                                #{index + 1}
                              </span>
                              <span className="text-white/60 text-xs px-2 py-0.5 bg-white/10 rounded-full">
                                {getItemType(item)}
                              </span>
                              {isActive && (
                                <span className="text-green-400 text-xs animate-pulse">
                                  ♪
                                </span>
                              )}
                            </div>
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                              {getItemName(item)}
                            </h3>
                            {getItemDescription(item) && (
                              <p className="text-white/60 text-xs line-clamp-1 mt-0.5">
                                {getItemDescription(item)}
                              </p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePlayItem(index)}
                              data-ocid={`playlist.item.${filteredPos + 1}.button`}
                              className={`text-white/70 hover:text-white ${themeStyles.buttonGlow} transition-all duration-300 min-h-[40px] min-w-[40px] h-9 w-9`}
                              title={t.play}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              data-ocid={`playlist.delete_button.${filteredPos + 1}`}
                              className={`text-red-400/70 hover:text-red-300 ${themeStyles.buttonGlow} transition-all duration-300 min-h-[40px] min-w-[40px] h-9 w-9`}
                              title={t.playlist.remove}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Footer Controls */}
        {player.queue.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <Button
                onClick={handleStartPlaylist}
                data-ocid="playlist.primary_button"
                className={`bg-white/95 text-black hover:bg-white ${themeStyles.buttonGlow} transition-all duration-300 px-4 sm:px-6 min-h-[44px] text-sm sm:text-base`}
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t.playlist.startPlaylist}
              </Button>
              <Button
                onClick={handleShufflePlaylist}
                data-ocid="playlist.secondary_button"
                variant="outline"
                className={`border-white/30 text-white hover:bg-white/10 ${themeStyles.buttonGlow} transition-all duration-300 px-4 sm:px-6 min-h-[44px] text-sm sm:text-base`}
              >
                <ShuffleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t.playlist.shufflePlaylist}
              </Button>
              <Button
                onClick={handleClearPlaylist}
                data-ocid="playlist.delete_button"
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
