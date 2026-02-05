# Specification

## Summary
**Goal:** Add a header Settings entry point that provides access to the app’s Privacy Policy link.

**Planned changes:**
- Add a new Settings (gear) button to the header’s top-right button group alongside the existing Theme and Language buttons (responsive on mobile and desktop).
- Implement a settings popup/panel anchored to the header that opens when the Settings button is clicked/tapped.
- Add a clearly visible "Privacy Policy" link inside the settings popup/panel that opens https://sites.google.com/view/frequencyverseapp/privacy-policy in a new tab/window using `target="_blank"` and `rel="noopener noreferrer"`.
- Ensure the settings popup/panel can be dismissed without interfering with existing Theme/Language popups.
- Keep the existing footer "Privacy Policy" link unchanged and pointing to the same URL.

**User-visible outcome:** Users can open a new Settings popup from the top-right header area and click "Privacy Policy" to open the policy page in a new tab, while the footer Privacy Policy link continues to work as before.
