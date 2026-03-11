import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Heart, Play, Plus, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../hooks/useLanguage";
import type { PeacefulSound } from "../lib/peacefulSounds";

interface PeacefulSoundCardProps {
  sound: PeacefulSound;
  isPlaying: boolean;
  onToggle: () => void;
  isInPlaylist?: boolean;
  onAddToPlaylist?: () => void;
  isDisabled?: boolean;
}

export default function PeacefulSoundCard({
  sound,
  isPlaying,
  onToggle,
  isInPlaylist = false,
  onAddToPlaylist,
  isDisabled = false,
}: PeacefulSoundCardProps) {
  const { t } = useLanguage();
  const [showTemporaryCheck, setShowTemporaryCheck] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(sound.id);

  // Reset temporary check when item is removed from playlist
  useEffect(() => {
    if (!isInPlaylist) {
      setShowTemporaryCheck(false);
    }
  }, [isInPlaylist]);

  const handleAddToPlaylist = () => {
    if (!onAddToPlaylist || isInPlaylist) return;

    onAddToPlaylist();
    setShowTemporaryCheck(true);

    // Reset temporary check after 2 seconds
    setTimeout(() => {
      setShowTemporaryCheck(false);
    }, 2000);
  };

  const showCheckmark = isInPlaylist || showTemporaryCheck;

  const getSoundTitle = () => {
    return t.peacefulSounds[sound.title];
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 bg-white/10 backdrop-blur-md">
      <CardContent className="p-3 xs:p-4">
        <div className="flex items-center gap-2 xs:gap-3">
          {/* Sound Name - flex-1 to take available space */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm xs:text-base font-bold text-white drop-shadow-lg truncate">
              {getSoundTitle()}
            </h3>
          </div>

          {/* Play Button - compact size */}
          <Button
            onClick={onToggle}
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            className="flex-shrink-0 h-9 px-3 font-semibold transition-all duration-300 shadow-lg"
            disabled={isDisabled}
          >
            {isPlaying ? (
              <>
                <Square className="h-4 w-4 xs:mr-1" />
                <span className="hidden xs:inline">{t.stop}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 xs:mr-1" />
                <span className="hidden xs:inline">{t.play}</span>
              </>
            )}
          </Button>

          {/* Favorite Button */}
          <Button
            onClick={() => toggleFavorite(sound.id)}
            variant="ghost"
            size="icon"
            className={`flex-shrink-0 h-9 w-9 transition-all duration-300 ${
              favorited
                ? "text-red-400 hover:text-red-300 hover:bg-red-400/10"
                : "text-white/40 hover:text-white/70 hover:bg-white/10"
            }`}
            title={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-400" : ""}`} />
          </Button>

          {/* Add to Playlist Button */}
          {onAddToPlaylist && (
            <Button
              onClick={handleAddToPlaylist}
              variant="ghost"
              size="icon"
              className={`flex-shrink-0 h-9 w-9 transition-all duration-300 ${
                showCheckmark
                  ? "text-green-400 hover:text-green-300 hover:bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                  : "text-white/60 hover:text-white hover:bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              }`}
              disabled={isDisabled}
              title={
                isInPlaylist ? t.playlist.inPlaylist : t.playlist.addToPlaylist
              }
            >
              {showCheckmark ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Playing indicator - shown below on mobile if playing */}
        {isPlaying && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={`bar-${i}`}
                  className="w-1 bg-white rounded-full animate-pulse shadow-lg"
                  style={{
                    height: "16px",
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
