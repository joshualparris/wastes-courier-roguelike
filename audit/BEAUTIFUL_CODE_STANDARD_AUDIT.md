# wastes-courier-roguelike — Beautiful Code Standard Audit

**Audit date:** 17 September 2026  
**Repository tier:** Experimental / active game  
**Standard:** The Beautiful Code Standard

## Overall finding

The game has a sensible TypeScript domain structure (`models`, `systems`, `scenes`, `content`, `utils`) and a deterministic RNG utility, which are good signs for local reasoning. The repo currently deploys to Pages but shows no visible test suite or CI quality gate beyond deployment. `RunScene.ts` is much larger than neighbouring modules, so it is the first place to inspect for mixed responsibilities—but not to split blindly.

Repository hygiene also needs attention: a ~79 KB VS Code/WSL setup note and its Windows `Zone.Identifier` metadata are committed alongside the game.

## Priorities

1. Remove the `Zone.Identifier` and unrelated setup dump if they are not product documentation.
2. Add focused tests for deterministic systems such as combat, turns, grid logic and seeded RNG.
3. Add one browser smoke test: load game → start run → perform a core action → observe valid state change.
4. Make build/test checks run before deployment rather than treating successful Pages deployment as proof of playability.
5. Review `RunScene.ts` for genuine responsibilities that belong in existing systems; extract only when that makes the game easier to understand.
6. Keep complexity/CRAP as signals or ratchets, not targets.

## Bottom line

The architecture is already moving in a good direction. **Protect the game systems with tests and keep the repo focused on the game itself.**
