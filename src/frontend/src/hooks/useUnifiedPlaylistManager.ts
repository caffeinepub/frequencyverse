import { useCallback, useEffect, useRef, useState } from "react";
import { useMainPlayer } from "./useMainPlayer";

export interface PlaylistItem {
  type: "frequency" | "sound";
  id: number | string;
}

export function useUnifiedPlaylistManager() {
  const player = useMainPlayer();
  const [isPlaylistActive, setIsPlaylistActive] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  // Use player.queue as the source of truth for the playlist
  const playlist = player.queue;

  const addFrequencyToPlaylist = useCallback(
    (hz: number) => {
      const exists = player.queue.some(
        (item) => item.type === "frequency" && item.id === hz,
      );
      if (exists) {
        return; // Already in playlist, don't add duplicate
      }

      const newQueue = [
        ...player.queue,
        { type: "frequency" as const, id: hz },
      ];

      // If nothing is playing, just update the queue without starting playback
      if (!player.isPlaying && !isPlaylistActive) {
        player.playQueue(newQueue, "playlist");
        player.pause(); // Immediately pause to just update the queue
      } else {
        // Update queue while maintaining current playback
        player.playQueue(newQueue, player.playMode, player.sessionName);
        if (player.currentIndex >= 0) {
          player.updateCurrentIndex(player.currentIndex);
        }
      }
    },
    [player, isPlaylistActive],
  );

  const addSoundToPlaylist = useCallback(
    (soundId: string) => {
      const exists = player.queue.some(
        (item) => item.type === "sound" && item.id === soundId,
      );
      if (exists) {
        return; // Already in playlist, don't add duplicate
      }

      const newQueue = [
        ...player.queue,
        { type: "sound" as const, id: soundId },
      ];

      // If nothing is playing, just update the queue without starting playback
      if (!player.isPlaying && !isPlaylistActive) {
        player.playQueue(newQueue, "playlist");
        player.pause(); // Immediately pause to just update the queue
      } else {
        // Update queue while maintaining current playback
        player.playQueue(newQueue, player.playMode, player.sessionName);
        if (player.currentIndex >= 0) {
          player.updateCurrentIndex(player.currentIndex);
        }
      }
    },
    [player, isPlaylistActive],
  );

  const removeFrequencyFromPlaylist = useCallback(
    (hz: number) => {
      const newQueue = player.queue.filter(
        (item) => !(item.type === "frequency" && item.id === hz),
      );
      if (newQueue.length > 0) {
        player.playQueue(newQueue, player.playMode, player.sessionName);
        if (player.currentIndex >= newQueue.length) {
          player.updateCurrentIndex(Math.max(0, newQueue.length - 1));
        }
      } else {
        player.stop();
      }
    },
    [player],
  );

  const removeSoundFromPlaylist = useCallback(
    (soundId: string) => {
      const newQueue = player.queue.filter(
        (item) => !(item.type === "sound" && item.id === soundId),
      );
      if (newQueue.length > 0) {
        player.playQueue(newQueue, player.playMode, player.sessionName);
        if (player.currentIndex >= newQueue.length) {
          player.updateCurrentIndex(Math.max(0, newQueue.length - 1));
        }
      } else {
        player.stop();
      }
    },
    [player],
  );

  const isFrequencyInPlaylist = useCallback(
    (hz: number) => {
      return player.queue.some(
        (item) => item.type === "frequency" && item.id === hz,
      );
    },
    [player.queue],
  );

  const isSoundInPlaylist = useCallback(
    (soundId: string) => {
      return player.queue.some(
        (item) => item.type === "sound" && item.id === soundId,
      );
    },
    [player.queue],
  );

  const startPlaylist = useCallback(() => {
    if (player.queue.length === 0) return;

    const totalDurationMs = player.selectedDuration * 60 * 1000;
    player.setTotalDuration(totalDurationMs);
    player.setTimeRemaining(totalDurationMs);

    // Start playing the queue
    player.playQueue(player.queue, "playlist");
    setIsPlaylistActive(true);

    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
  }, [player]);

  const pausePlaylist = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
    player.pause();
  }, [player]);

  const resumePlaylist = useCallback(() => {
    startTimeRef.current = Date.now();
    player.resume();
  }, [player]);

  const stopPlaylist = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaylistActive(false);
    player.stop();
    startTimeRef.current = 0;
    elapsedBeforePauseRef.current = 0;
  }, [player]);

  const toggleLoop = useCallback(() => {
    setLoopEnabled((prev) => !prev);
  }, []);

  // Timer management
  useEffect(() => {
    if (!isPlaylistActive || !player.isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const totalElapsed =
        elapsedBeforePauseRef.current + (Date.now() - startTimeRef.current);
      const remaining = player.totalDuration - totalElapsed;

      if (remaining <= 0) {
        stopPlaylist();
        return;
      }

      player.setTimeRemaining(remaining);

      const itemDuration = player.totalDuration / player.queue.length;
      const currentItemIndex = Math.floor(totalElapsed / itemDuration);

      if (
        currentItemIndex !== player.currentIndex &&
        currentItemIndex < player.queue.length
      ) {
        player.updateCurrentIndex(currentItemIndex);
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaylistActive, player, stopPlaylist]);

  // Handle loop
  useEffect(() => {
    if (
      loopEnabled &&
      !player.isPlaying &&
      isPlaylistActive &&
      player.timeRemaining <= 0
    ) {
      startPlaylist();
    }
  }, [
    loopEnabled,
    player.isPlaying,
    isPlaylistActive,
    player.timeRemaining,
    startPlaylist,
  ]);

  return {
    playlist,
    isPlaylistActive,
    loopEnabled,
    addFrequencyToPlaylist,
    addSoundToPlaylist,
    removeFrequencyFromPlaylist,
    removeSoundFromPlaylist,
    isFrequencyInPlaylist,
    isSoundInPlaylist,
    startPlaylist,
    pausePlaylist,
    resumePlaylist,
    stopPlaylist,
    toggleLoop,
  };
}
