# Specification

## Summary
**Goal:** Repair the Player “Animation” tab and provide stable, per-sound meditation-style fullscreen animations that render reliably during playback.

**Planned changes:**
- Fix the Player’s Animation section so it opens and renders reliably while audio is playing, without runtime errors/blank screens, and can be closed without interrupting audio.
- Add a centralized, deterministic mapping from the currently playing item (soundId and/or frequency) to a meditation animation type so every supported item always has a valid animation selection.
- Improve fullscreen visualization behavior so animations truly cover the entire viewport, respond correctly to resize/orientation changes, and remain visually comfortable (smooth/slow, low flicker).
- Route all visualization/animation UI text through the existing localization system and ensure it is English-only (remove any hardcoded non-English strings in these components).

**User-visible outcome:** While a sound or frequency is playing, users can open the Animation view without crashes/white screens, see an appropriate meditation animation for the current sound/frequency, switch to fullscreen with proper screen coverage and smooth visuals, and return to the player without stopping audio.
