# Changelog

## 2.3.3 - 2026-09-12

- Fix the panel refusing to close on Omarchy 4, where the bar's PluginBarApi
  exposes `centerHoverRevealSuppressed` as a readonly mirror instead of a
  writable property.
- Fix a TypeError on every refresh from an unguarded day-strip binding.
- Take the location from a searched city or postal code instead of an
  IP-derived guess.
- Add Nojumi as a selectable calculation method, and disable the Hanafi Asr
  choice while it's selected since Nojumi has no Hanafi convention of its own.

## 2.3.2 - 2026-08-31

- Render location, Hijri, status, and prayer labels as literal plain text so
  markup-shaped network responses cannot be interpreted by the shell,
  including the shared Omarchy 4.0.1 bar tooltip.
- Constrain hand-edited bar-display settings to the documented option ring
  before Omarchy's inherited dropdown renders them.

## 2.3.1 - 2026-08-31

- Disclose beside the controls, before any request, that city search sends its
  text to Open-Meteo and Detect asks wttr.in for an IP-derived location.
- Validate the plugin against current Omarchy Quattro and run its isolated test
  suite in CI.

## 2.3.0 - 2026-08-21

- Keep the panel IPC target available while moving its bar slot.
