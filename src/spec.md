# Specification

## Summary
**Goal:** Fix audio routing so legacy frequency tones always use Web Audio oscillator playback, while non-frequency sounds use Android native `res/raw` playback when available, with consistent playback control from a single shared audio manager.

**Planned changes:**
- Update unified audio routing to always play Frequencies (e.g., 432 Hz) via Web Audio oscillator and never call `window.AndroidAudio.playSound(...)` for frequency items, even when `window.AndroidAudio` exists.
- Update unified audio routing so kids sleep sounds and peaceful sounds use `window.AndroidAudio.playSound(cleanSoundId)` on Android/WebView when available, and do not run oscillator/frequency parsing fallback for these sound IDs.
- Refactor MainPlayer / `useMainPlayer` integration to use a single shared audio manager instance so play/pause/resume/stop and track changes control the actual active audio output and visualization intensity source.
- Add developer-facing console logs that clearly indicate which routing path is used (frequency via Web Audio vs non-frequency via Android native) to verify they are not being mixed.

**User-visible outcome:** On Android/WebView, tapping a frequency reliably plays an oscillator tone, tapping a non-frequency sound plays via Android native audio, and MainPlayer controls (play/pause/resume/stop) consistently affect the audible playback with clear console logs for verification.
