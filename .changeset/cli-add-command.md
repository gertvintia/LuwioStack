---
"@luwio/cli": minor
---

Add a `luwio add [modules]` command that adds optional `@luwio/*` modules to the app in the current
directory. Run it with no arguments to pick interactively from the modules you don't already have
(the same catalog the `create` bootstrap prompt uses), or name them directly (`luwio add phone
theme`). New deps are written to `package.json`, matching `workspace:*` when the app already uses it;
names already installed or unknown are reported and skipped.
