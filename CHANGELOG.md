# Changelog

All notable changes to this fork are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed
- Removed unauthenticated command injection in `files.moveToTrash`
  (osascript shell-out with interpolated input). Trash is now a shell-free
  `fs.rename` into the platform trash dir; input requires non-empty string.
  ([#2](https://github.com/satwareAG-ironMike/vibeOS/issues/2))
- Hardened the Dedalus agent `bash` tool: non-empty string guard, explicit
  `/bin/bash`, 32k output caps with truncation flag, per-invocation audit log
  with secret redaction. `shell=True` retained by design (agent pipes/globs
  are the tool contract), annotated as accepted risk.
  ([#3](https://github.com/satwareAG-ironMike/vibeOS/issues/3))
- Pinned all GitHub Actions in `docker.yml` to full SHAs with version
  comments; `checkout` uses `persist-credentials: false`.
  ([#4](https://github.com/satwareAG-ironMike/vibeOS/issues/4))
- Bumped `next` 15.5.0 -> 15.5.27 (28 OSV advisories incl. middleware bypass)
  and `ai` 5.0.22 -> 5.0.271 (filetype-whitelist bypass), plus an `overrides`
  pin so the nested copy under `@ai-sdk/react` resolves to the fixed version.
  ([#5](https://github.com/satwareAG-ironMike/vibeOS/issues/5))
- Bumped `authlib` 1.6.1 -> 1.8.0 in `experiments/browser-use-CDP/uv.lock`
  (CVE-2026-27962 and related) and `browser-use` 0.13.7 -> 0.13.10 in
  `requirements.txt` and both `uvx --from` pins. Residual `anyio`/`pypdf`
  advisories are framework-captive (see issue).
  ([#6](https://github.com/satwareAG-ironMike/vibeOS/issues/6))
- Added baseline response headers (`nosniff`, `same-origin` referrer,
  `SAMEORIGIN` framing) and a Report-Only CSP covering generated-app
  `blob:` imports. CSP enforcement deferred until the container runs a
  production server (dev HMR needs `unsafe-eval`).
  ([#7](https://github.com/satwareAG-ironMike/vibeOS/issues/7))

### Security
- Full audit baseline 2026-10-04 (rev `e3372e9`): 14 qualifying findings
  across secrets/sast/deps/container/ci/license with zero coverage gaps;
  SBOM (765 components, CycloneDX + SPDX) generated during the audit.
  Supply-chain signing is still absent (SLSA 0).
  ([#8](https://github.com/satwareAG-ironMike/vibeOS/issues/8))
