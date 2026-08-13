# Release Source Policy

Current source of truth:

- Development workspace: `D:\Acodex3\dahuang-lunhui-lu`
- Development branch: `develop`
- Release branch: `main`

Do not publish from:

- `D:\Acodex3\dahuang-lunhui-lu-gh-pages`
- any folder whose name ends with `-gh-pages`
- branches named `deploy/v0.3.2-online`, `gh-pages`, or other historical deployment branches

Release flow:

1. Work on `develop`.
2. Run local verification and visual QA.
3. Merge `develop` into `main`.
4. Run:

```bash
npm run build
npm run audit:assets
npm run audit:style
npm run verify:release
```

5. Only after these pass, publish `main` to GitHub Pages / Sites.

Release guardrails:

- `main` is the only branch allowed by `tools/verify-release-source.mjs`.
- The working tree must be clean before publishing.
- Runtime config must not include removed Shennong entries: `神农丹徒`, `丹徒`, `alchemist`, `shennong`, `herb_marsh`.
- `index.html` must reference the current runtime cache version.
- The generated `deploy-root` package must match source config.

Current release version:

- `0.3.4b1-ui-pass2`
- playable lineages: `轩辕遗剑`, `青丘巫女`

Notes:

- `gh-pages` is an output branch, not a working branch.
- ChatGPT Sites packaging must be generated from the same clean `main` state.
- If the public page appears stale, check the online `index.html` cache version before pushing again.
