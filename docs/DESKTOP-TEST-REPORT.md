# Accent lead desktop verification

Test date: 2026-09-22, Africa/Cairo. Current desktop: Omarchy 4.0.4-1,
Quickshell, one 2560 × 1440 display, user's installed notification service.

The working tree's runtime files matched the installed plugin byte for byte.
The shell was restarted before the successful run. Copying the changed files
and rescanning alone did not activate the new timing in the first attempt.
No diagnostic instrumentation remained in the qualified code.

Tests used temporary Dhuhr tuning offsets to put real event boundaries near
the current time. The system clock, model, timer interval, and notification
helper were unchanged. The panel was closed during delivery. D-Bus monitoring,
notification deduplication state, and inspected desktop screenshots provided
evidence of delivery. Settings were changed between cases in the running shell.

| Case | Result |
|---|---|
| Accent lead 20, legacy reminder value 10 | One English reminder; bar accent and toast showed 20 minutes |
| Accent lead 5, legacy reminder value 10 | One Arabic reminder; bar accent and toast showed 5 minutes |
| Accent lead 20, cross the legacy 10-minute boundary | No reminder |
| Accent lead Off, notifications enabled | One Arabic prayer-time notification |
| Notifications disabled, cross 20-minute advance boundary | No reminder |
| Notifications disabled, cross prayer-time boundary | No notification |

All six cases passed. The D-Bus trace contained exactly the three expected
prayer notifications, with no duplicates. English and Arabic toast screenshots
and the settings panel were visually inspected. The running shell's log had
no OmaPrayers runtime errors during the successful run.

The original widget settings and notification deduplication state were
restored and checked after the run. The normal location, English language,
and untuned Dhuhr countdown returned. The updated plugin remains installed.

The full automated suite, nine new notification-lead regression cases,
manifest validation, ShellCheck, and whitespace checks passed before this
live run. Live test evidence is stored locally in
`/tmp/omaprayers-desktop-test/` (results JSON, D-Bus trace, screenshots, and
restoration backups); desktop screenshots are not committed.

This run covers the changed notification timing on the current desktop.
Physical multi-monitor deduplication, suspend/resume, and delivery-service
failure recovery were not manually exercised. Existing automated checks
cover reminder grace boundaries, deduplication, and failed-delivery retries.
