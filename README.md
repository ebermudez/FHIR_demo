# Note to Record

**Live demo:** [https://ebermudez.github.io/FHIR_demo/](https://ebermudez.github.io/FHIR_demo/)

## What this shows

An AI scribe writes a consultation note after a doctor's visit; a records integration has to turn that note into structured data the practice's system understands. This demo takes a short, made-up German consultation note and sends it to a public test [FHIR](https://www.hl7.org/fhir/) R4 server as a `Patient`, an `Encounter`, a `Condition` carrying the diagnosis, and a `DocumentReference` carrying the note text. It then reads the `DocumentReference` back from the server and shows it next to the original to prove the round trip worked byte-for-byte. A "Break it" button also sends a deliberately invalid resource so you can see what a rejected integration call looks like and how a team would fix it. The page defaults to English with an EN/DE toggle at the top; the consultation note itself always stays in German, since that's the real artifact an integration would receive.

Everything happens directly from the browser to [hapi.fhir.org/baseR4](https://hapi.fhir.org/baseR4), a public HL7 test server — there is no backend, no database, and no real patient data.

## The mapping

| Part of the note | FHIR field |
|---|---|
| Patientin: Erika Mustermann | `Patient.name` |
| Geburtsdatum: 14.03.1975 | `Patient.birthDate` |
| Geschlecht: weiblich | `Patient.gender` |
| Termin: 07.10.2026 | `Encounter.period.start` |
| Beurteilung: Akute unspezifische lumbale Rückenschmerzen (ICD-10-GM M54.50) | `Condition.code` = ICD-10-GM `M54.50`, linked via `Condition.subject` / `.encounter` |
| Document type (consult note) | `DocumentReference.type` = LOINC `11488-4` |
| Link to patient & visit | `DocumentReference.subject` / `.context.encounter` |
| Full note text | `DocumentReference.content.attachment.data` (base64) |

The `Condition` resource uses the official German ICD-10-GM code system URL (`http://fhir.de/CodeSystem/bfarm/icd-10-gm`). The note originally cited the WHO base code `M54.5` ("Kreuzschmerz"), but ICD-10-GM has since split that into three more specific subcodes (`M54.50`/`M54.51`/`M54.59`) — `M54.50` ("Kreuzschmerz, nicht näher bezeichnet") is the correct one here, since the note describes the pain as unspecified with no vertebrogenic findings on exam.

## Screenshots

**Round trip** — note sent, stored, and read back unchanged:

![Round trip](screenshots/roundtrip.jpg)

**Break it** — an invalid resource, and what the server says about it:

![Break it](screenshots/break-it.jpg)

## What would change in production

- **Authentication** through SMART on FHIR (OAuth 2.0) instead of an open, anonymous server.
- **German FHIR profiles**, such as ISiK, instead of plain base R4 resources.
- **Validation against the target system's profile before sending**, not just a generic `$validate` call against base FHIR.
- **Logging and monitoring per partner system**, since every record system fails slightly differently and an integration team needs to see that per connection, not just in a browser console.

## A note on the "Break it" button

The public HAPI test server doesn't enforce FHIR's required fields on a plain `POST` — it will silently accept a `DocumentReference` missing its required `status` field. To show a real rejection, "Break it" calls the server's `$validate` operation instead, which does run FHIR's structural rules and returns an `OperationOutcome` flagging the missing field. That gap between "the server will store it" and "the server considers it valid" is itself a small, realistic lesson about integration testing: a permissive test server is not the same as a conformant one.

## Out of scope

User accounts, a database, AI-generated notes, and any real patient data.

## About

Built by Edgardo Bermudez as a prototype with Claude Code · [LinkedIn](https://www.linkedin.com/in/edgardobermudez/)
