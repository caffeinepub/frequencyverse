import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fv_recently_played";
const MAX_ITEMS = 20;

export interface RecentItem {
  id: string; // "freq-528" or sound id like "peaceful-light-rain"
  timestamp: number;
}

export function useRecentlyPlayed() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
    } catch {
      // ignore storage errors
    }
  }, [recentItems]);

  const addRecentItem = useCallback((id: string) => {
    setRecentItems((prev) => {
      // Remove existing entry for this id
      const filtered = prev.filter((item) => item.id !== id);
      // Add to front
      const updated = [{ id, timestamp: Date.now() }, ...filtered];
      // Limit to MAX_ITEMS
      return updated.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
  }, []);

  return { recentItems, addRecentItem, clearRecentItems };
}
