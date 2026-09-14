# CASE CLASH recovery checkpoint — 2026-09-14

Existing repository: sadadafs8-pixel/chatruletk. Branch: case-clash-demo. Do not recreate or modify main.

This revision replaces the Upgrade selection UX with a unified terminal. Desktop has source / probability / target and two independent item lists. Mobile has a prominent ring, readable source/target cards and MY ITEMS / TARGETS tabs. Search, value sorting, rarity filters and selected states are implemented. CONFIG.upgrade owns margin, max chance and animation duration; upgradeChance is the shared two-decimal probability used by UI and RNG. Result is committed before animation; busy blocks a second attempt. Both outcomes update the shared inventory, XP, missions and stats. Bots now expose profile identities, levels and statistics.

Validation completed in this turn: JavaScript syntax and a deterministic runtime test against actual app/config/services/game sources (mock DOM and storage only): all 64 source/target pairs, displayed odds equal RNG odds, target changes, success/failure inventory, stats and XP, duplicate upgrade, search empty state, bot identity, payment outcomes/replay, all 10,000 wheel buckets. Reproduce with node case-clash/upgrade-test.cjs.

Earlier browser checks in this conversation covered x1/x3/x5, inventory filters, old Upgrade failure, all three battle sizes, wheel rewards and blocking attempt four, and a successful 80-Gem purchase. These checks predate the NEW Upgrade terminal and do not constitute acceptance for this revision.

BLOCKER: selected execution environment became unavailable. Terminal and Cloud Browser tools were removed. No mobile/desktop visual QA or deployed interaction test of this revision has occurred. Do NOT mark the user acceptance checklist complete.

Resume: clone/reuse this exact branch, preserve local changes if present, run engine-test.cjs and upgrade-test.cjs, run scripts/sync-case-clash.py, then test new Upgrade desktop and 390×844, selection/filter/sort and both outcome visuals. Complete payment failure/cancel, Premium, pass claims, daily, missions, four leaderboard tabs, reload and reset in browser. Retest any fixes and final URL.

Existing demo entry point:
https://htmlpreview.github.io/?https://github.com/sadadafs8-pixel/chatruletk/blob/case-clash-demo/case-clash/index.html

Production still needs authoritative backend, payment/webhook verification, rewarded ad provider and production content.
