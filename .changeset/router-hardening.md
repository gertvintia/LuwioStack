---
"@luwio/router": minor
---

Harden `useRouter` href/navigation resolution:

- `path`/`href`/`absolute` now **throw** when a required `$param` is missing, instead of silently
  dropping the segment and producing a wrong URL.
- Detect circular parent chains in `path`/`href` and `availableLocales` — a misconfigured `parent`
  cycle now throws a clear error instead of hanging (and `createRouter`'s route selection is
  cycle-guarded too).
- `navigate` drops `null`/`undefined` query values (matching `href`) while preserving
  number/boolean types so a typed `validateSearch` still receives them.
