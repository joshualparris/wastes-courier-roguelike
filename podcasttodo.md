# Podcast Integration TODO

**Decision:** Implemented 16 September 2026 with a local, game-safe player.
**Topic bank:** roguelikes, indie game design, procedural generation, level design and systems design.

## Completed
- [x] Curate 25 English Spotify episodes relevant to roguelikes and game design.
- [x] Add a collapsed **🎧 Podcasts** launcher.
- [x] One tap opens the player; **🎲 Different podcast** avoids an immediate repeat.
- [x] Persist the selected episode locally.
- [x] Use Spotify embed/deep links without assuming autoplay.
- [x] Keep the Spotify iframe mounted when the controls are closed so playback continues in the background.
- [x] Collapse the controls when page audio starts without destroying the active Spotify player.
- [x] Tag episodes by procedural generation, systems, roguelikes, indie development and level design.
- [x] Add a persistent **Hide podcasts** option; hidden mode leaves only a faint restore tab while preserving playback.
- [x] Keep the implementation local to this repo rather than depending on the shared JoshHub launcher.

## Implementation
`public/podcast-player.js` contains the 25-episode bank, persistent Spotify iframe, selection logic, persistence and hide/show behaviour. Closing or hiding the controls no longer removes the iframe, so an episode can keep playing while the game remains visible. `index.html` loads it directly from `/podcast-player.js`.
