---
"@luwio/eid": minor
---

Add the `@luwio/eid/node` PC/SC transport and implement the Belgium (BELPIC) read.

`@luwio/eid/node` exports `nodeCardReader()` — a `CardReader` backed by the OS PC/SC stack via the native `@pokusew/pcsclite` module (an optional dependency the app installs; loaded dynamically, with a clear error if missing). It's a separate Node-only entry point, so browser bundles never pull it in. Pass it to `Eid.read(reader, country)` or `<Eid reader={…}>`.

The Belgium card profile now actually reads: it SELECTs and READ BINARYs the BELPIC identity, address and photo files, parses their simple-TLV structure, and returns a normalized `IIdentityDocument` (names, national number, birth place, address, photo, validity). Birth date and sex are derived from the Rijksregisternummer via `@luwio/national-id` (language-independent and century-unambiguous), falling back to the card's own fields; the national number is cross-validated and the country hydrated via `@luwio/country`. The APDU/TLV logic is isomorphic — it runs over any `CardSession`, so it's fully testable without hardware. Other countries still reject `NotImplementedError`.
