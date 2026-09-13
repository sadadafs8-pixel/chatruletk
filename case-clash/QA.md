# CASE CLASH — browser verification

Verified 2026-09-13 against application commit `82f296756e8d2320c94a0f379b2016ac23fe3e1b`.

## Visual checks

- Desktop Chrome: supplied 1024 × 1536 composition, hero, six case images, eight weapon images, full-width lower sections, event and footer inspected in screenshots.
- Mobile: the same application rendered inside the committed `mobile-preview.html` fixture with a real 390 × 844 iframe viewport. This checks responsive Chrome rendering, not native Safari/device emulation.
- Main page client width and scroll width: both 390 px.
- Open mobile dialog: left 10 px, right 380 px; close and action buttons fit on screen.
- Battles, upgrade, contract, tasks, referrals and profile dialogs: no horizontal overflow.
- Roulette winner center and marker center after the result appears: difference 0 px.

## Interaction coverage

- Sidebar: Home, Cases, Battles, Upgrade, Contract, Shop, Tasks, Referrals, leaderboard, support, daily reward.
- Top navigation: Cases, Upgrade, Battles, Contract, Events; balance controls, notifications and profile.
- All six case cards and hero previous/next controls; opening, replay, inventory transition and insufficient-balance path.
- All eight Live Drops cards open their corresponding weapon and finish.
- Battle creation and 1x1 / 2x2 / 3x3 modes. Completed outcomes checked; entry balance, team scores, victory reward and persisted history checked. A draw refunds the fee and appears as a draw in history.
- Upgrade consumes the selected item and produces its success/failure outcome. Contract consumes exactly three selected items and stores one result.
- Shop: free demo top-up and conversion of 100 gems into 100 coins.
- Rewarded-ad simulation: timed completion and reward. Daily reward is blocked after the first daily claim.
- Profile name save, referral copy, local support draft save, Events/Tasks/Referrals panel links.
- Footer: terms, privacy, Telegram, YouTube, TikTok, Discord and language controls open their associated panels.
- Dialog close control, Escape and keyboard activation verified. Browser coordinate-click automation occasionally missed targets; corresponding controls were additionally checked through visible DOM actions and keyboard activation.

## Persistence scenario

Five free openings produced five inventory items. Claiming the opening task added 50 coins. The Winter Event added a sixth item. After reload, profile showed 5 openings, 6 items and the expected 187-coin balance. The claimed event reward was disabled. Subsequent battle history and inventory changes also persisted across page versions on the same origin.

## Scope

This is a local-state demo: no money stakes, cashout, live ad network or real multiplayer. Battles use demo bots; referrals copy a playable link but do not track real invitees; support saves a local draft. The reference art is embedded as a CSS sprite atlas, with actual HTML controls and JavaScript state changes. The main branch was not modified.

No application JavaScript errors were observed during the checks. Cloud-browser extension metadata errors were present separately from the application's code.

Final visual cleanup removed a residual source-text fragment behind the battle description and the pre-initialization gift emoji. Desktop and 390 × 844 composition were re-inspected.
