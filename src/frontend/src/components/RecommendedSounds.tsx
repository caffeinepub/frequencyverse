import { Button } from "@/components/ui/button";
import { Check, Play, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useMainPlayer } from "../hooks/useMainPlayer";
import { useUnifiedPlaylistManager } from "../hooks/useUnifiedPlaylistManager";
import { useUnifiedSessionManager } from "../hooks/useUnifiedSessionManager";
import { kidsSleepSounds } from "../lib/kidsSleepSounds";
import type { RecommendedItem } from "../lib/moodRecommendations";
import type { MoodType } from "../lib/moods";
import { peacefulSounds } from "../lib/peacefulSounds";

interface RecommendedSoundsProps {
  recommendations: RecommendedItem[];
  moodType: MoodType;
}

export default function RecommendedSounds({
  recommendations,
  moodType,
}: RecommendedSoundsProps) {
  const { t } = useLanguage();
  const player = useMainPlayer();
  const sessionManager = useUnifiedSessionManager();
  const playlistManager = useUnifiedPlaylistManager();
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Clear recently added state when items are removed from playlist
  useEffect(() => {
    setRecentlyAdded((prev) => {
      const newRecentlyAdded = new Set<string>();
      for (const key of prev) {
        const [type, id] = key.split("-");
        const isStillInPlaylist =
          type === "frequency"
            ? playlistManager.isFrequencyInPlaylist(Number(id))
            : playlistManager.isSoundInPlaylist(id);
        if (isStillInPlaylist) {
          newRecentlyAdded.add(key);
        }
      }
      if (newRecentlyAdded.size === prev.size) return prev;
      return newRecentlyAdded;
    });
  }, [playlistManager]);

  const getItemName = (item: RecommendedItem): string => {
    if (item.type === "frequency") {
      return `${item.id} Hz`;
    }
    const soundId = item.id as string;
    const kidsSound = kidsSleepSounds.find((s) => s.id === soundId);
    if (kidsSound) {
      const category = kidsSound.category;
      return t.kidsSleepSounds[category][kidsSound.title];
    }
    const peacefulSound = peacefulSounds.find((s) => s.id === soundId);
    if (peacefulSound) {
      return t.peacefulSounds[peacefulSound.title];
    }
    return soundId;
  };

  const getItemDescription = (item: RecommendedItem): string => {
    if (item.type === "frequency") {
      return t.frequencies[item.id as number];
    }
    return "";
  };

  const handlePlay = (item: RecommendedItem) => {
    if (sessionManager.activeSession) {
      sessionManager.stopSession();
    }
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (item.type === "frequency") {
      player.playFrequency(item.id as number, "single");
    } else {
      player.playSound(item.id as string, "single");
    }
  };

  const handleAddToPlaylist = (item: RecommendedItem) => {
    const key = `${item.type}-${item.id}`;

    if (item.type === "frequency") {
      playlistManager.addFrequencyToPlaylist(item.id as number);
    } else {
      playlistManager.addSoundToPlaylist(item.id as string);
    }

    // Show temporary checkmark
    setRecentlyAdded((prev) => new Set(prev).add(key));

    // Remove temporary checkmark after 2 seconds
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 2000);
  };

  const handleStartSession = (item: RecommendedItem) => {
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (item.type === "frequency") {
      const frequencies = [item.id as number];
      const session = {
        id: `mood-${moodType}-${item.id}`,
        nameKey: moodType,
        frequencies,
        durationPerFrequency: 180,
      };
      sessionManager.startSession(session);
    } else {
      // For sounds, create a single-item queue
      player.playSound(item.id as string, "single");
    }
  };

  const isInPlaylist = (item: RecommendedItem): boolean => {
    if (item.type === "frequency") {
      return playlistManager.isFrequencyInPlaylist(item.id as number);
    }
    return playlistManager.isSoundInPlaylist(item.id as string);
  };

  const showCheckmark = (item: RecommendedItem): boolean => {
    const key = `${item.type}-${item.id}`;
    return isInPlaylist(item) || recentlyAdded.has(key);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-lg">
        <Sparkles className="w-6 h-6 text-yellow-300" />
        {t.moodSpace.recommendedSounds}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item, index) => (
          <div
            key={`${item.type}-${item.id}-${index}`}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="mb-3">
              <h4 className="text-white font-semibold text-lg mb-1">
                {getItemName(item)}
              </h4>
              {item.type === "frequency" && (
                <p className="text-white/70 text-sm">
                  {getItemDescription(item)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handlePlay(item)}
                size="sm"
                variant="default"
                className="flex items-center gap-1"
              >
                <Play className="w-4 h-4" />
                {t.moodSpace.actions.play}
              </Button>

              <Button
                onClick={() => handleAddToPlaylist(item)}
                size="sm"
                variant="outline"
                className={`flex items-center gap-1 transition-all duration-300 ${
                  showCheckmark(item)
                    ? "bg-green-400/20 border-green-400/40 text-green-300 hover:bg-green-400/30"
                    : "hover:bg-white/10"
                }`}
              >
                {showCheckmark(item) ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.playlist.inPlaylist}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t.playlist.addToPlaylist}
                  </>
                )}
              </Button>

              {item.type === "frequency" && (
                <Button
                  onClick={() => handleStartSession(item)}
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.moodSpace.actions.startSession}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
