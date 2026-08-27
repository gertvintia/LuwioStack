---
"@luwio/eid": minor
---

Add Estonia (EstEID) as a second implemented card reader. It's a proof of concept for the per-country registry extending to a genuinely different on-card scheme: unlike Belgium's binary TLV files, EstEID exposes personal data as fixed-position ASCII **records** read with `READ RECORD` — so it exercises a different APDU flow (new `selectFid` / `readRecord` helpers) through the same `CardReader` / `CardSession` abstraction. The Estonian personal-data file is open-read (no PIN), so it's a real, hardware-free-testable implementation: it reads surname, given names, sex, citizenship (mapped EST → EE), birth date, personal code (isikukood), document number, expiry and birth place into a normalized `IIdentityDocument`. `Eid.supportedCountries()` now includes `EE`.
