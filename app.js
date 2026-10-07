const FHIR_BASE = "https://hapi.fhir.org/baseR4";
const REQUEST_TIMEOUT_MS = 15000;
const ICD10GM_SYSTEM = "http://fhir.de/CodeSystem/bfarm/icd-10-gm";

const NOTE_TEXT = `Patientin: Erika Mustermann
Geburtsdatum: 14.03.1975
Geschlecht: weiblich
Termin: 07.10.2026, Hausarztpraxis Dr. Keller

Anamnese: Patientin berichtet über seit 3 Tagen bestehende Schmerzen im unteren Rücken, aufgetreten nach Gartenarbeit. Keine Ausstrahlung in die Beine, kein Taubheitsgefühl, keine Blasen- oder Darmstörung.

Untersuchung: Klopfschmerz über der LWS, Bewegungseinschränkung bei Flexion, Lasègue-Zeichen beidseits negativ, Fußpulse tastbar.

Beurteilung: Akute unspezifische lumbale Rückenschmerzen (ICD-10-GM M54.50).

Therapie: Ibuprofen 400 mg bei Bedarf, lokale Wärmeanwendung, Bewegung statt Schonung empfohlen.

Wiedervorstellung bei Beschwerdepersistenz über 2 Wochen oder neurologischen Ausfällen.`;

const translations = {
  en: {
    pageTitle: "Note to Record — from consultation note to FHIR",
    metaDescription: "Demo: how an AI scribe note becomes FHIR R4 resources in a medical record system.",
    tag: "Demo · sample data only",
    intro:
      "This is how a consultation note becomes a structured FHIR R4 record in a medical " +
      "record system: an AI scribe writes the note, the fields are mapped onto Patient, " +
      "Encounter, Condition, and DocumentReference, and the note is read back unchanged " +
      "from the server to prove the round trip.",
    noteHeading: "1. Consultation note",
    noteSub: "GP visit for back pain · fictional patient",
    mappingHeading: "2. Mapping to FHIR",
    mappingSub: "Which part of the note becomes which FHIR field",
    thNote: "Part of the note",
    thField: "FHIR field",
    rowDocType: "Type of document (consult note)",
    rowLink: "Link to patient & visit",
    rowFullText: "Full note text",
    actionsHeading: "3. Send to record system",
    actionsSub:
      '"Send to record" creates Patient, Encounter, Condition, and DocumentReference on ' +
      'the public HAPI FHIR test server and reads the note back. "Break it" sends a ' +
      "deliberately broken version of that same document, so you can see exactly what a " +
      "rejected integration call looks like and why.",
    sendBtn: "Send to record",
    breakBtn: "Break it",
    roundtripHeading: "4. Round trip comparison",
    roundtripSub: "Original note vs. the note decoded from the server",
    roundtripOriginalLabel: "Original",
    roundtripDecodedLabel: "Read back from server",
    logHeading: "5. API log",
    clearBtn: "Clear",
    footer1: "Test data, public server (",
    footer2: "), visible to everyone — no real patient data.",
    logEmpty: 'No calls yet. Click "Send to record".',
    sendingPatient: "Sending Patient…",
    sendingEncounter: "Sending Encounter…",
    sendingCondition: "Sending Condition…",
    sendingDocument: "Sending DocumentReference…",
    readingDocument: "Reading DocumentReference back…",
    errorPatient: "Error creating the Patient. See log.",
    errorEncounter: "Error creating the Encounter. See log.",
    errorCondition: "Error creating the Condition. See log.",
    errorDocument: "Error creating the DocumentReference. See log.",
    errorRead: "Error reading the document back. See log.",
    doneStatus: "Done: Patient/%s, Encounter/%s, Condition/%s, DocumentReference/%s created and successfully read back.",
    breakSending: "Sending an invalid DocumentReference (without status) for validation…",
    breakNetworkError: "Network error during the test. See log.",
    breakUnexpected: "Unexpected: the server marked the invalid resource as valid.",
    breakRejected: "The server rejected the resource as invalid, as expected.",
    explainText:
      'What we just did: we sent a version of the document with a required field called ' +
      '"status" deliberately left out. That field tells a record system whether a ' +
      "document is current, has been replaced, or was entered by mistake — real systems " +
      "need it to know whether they can trust what they're looking at. The server caught " +
      "this immediately and rejected the document, which is exactly what should happen: a " +
      "system that silently accepts broken data is far more dangerous than one that " +
      "clearly rejects it. To fix this for real, the application sending the note would " +
      "always include that field, and an integration would run this same kind of check " +
      "(called $validate) before anything reaches the target system.",
    serverDetail: " Server detail: %s",
    timeoutMsg: "Timeout: server did not respond after %ss.",
    networkErrorMsg: "Network error: %s",
  },
  de: {
    pageTitle: "Note to Record — von der Konsultationsnotiz zu FHIR",
    metaDescription: "Demo: wie eine KI-Scribe-Notiz als FHIR R4 Ressourcen in einem Praxisverwaltungssystem landet.",
    tag: "Demo · nur Testdaten",
    intro:
      "So wird aus einer Konsultationsnotiz ein strukturierter FHIR-R4-Datensatz im " +
      "Praxisverwaltungssystem: eine KI-Scribe schreibt die Notiz, die Felder werden auf " +
      "Patient, Encounter, Condition und DocumentReference abgebildet, und die Notiz wird " +
      "unverändert aus dem Server zurückgelesen, um den Roundtrip zu beweisen.",
    noteHeading: "1. Konsultationsnotiz",
    noteSub: "Hausarztbesuch wegen Rückenschmerzen · frei erfundene Patientin",
    mappingHeading: "2. Zuordnung zu FHIR",
    mappingSub: "Welcher Teil der Notiz landet in welchem FHIR-Feld",
    thNote: "Teil der Notiz",
    thField: "FHIR-Feld",
    rowDocType: "Art des Dokuments (Konsultationsnotiz)",
    rowLink: "Bezug zu Patientin & Termin",
    rowFullText: "Gesamter Notiztext",
    actionsHeading: "3. An das Record-System senden",
    actionsSub:
      '"Send to record" legt Patient, Encounter, Condition und DocumentReference auf dem ' +
      'öffentlichen HAPI-FHIR-Testserver an und liest die Notiz zurück. "Break it" sendet ' +
      "absichtlich eine fehlerhafte Version desselben Dokuments, damit sichtbar wird, wie " +
      "eine abgelehnte Integrationsanfrage aussieht und warum.",
    sendBtn: "Send to record",
    breakBtn: "Break it",
    roundtripHeading: "4. Roundtrip-Vergleich",
    roundtripSub: "Original-Notiz vs. aus dem Server dekodierte Notiz",
    roundtripOriginalLabel: "Original",
    roundtripDecodedLabel: "Vom Server zurückgelesen",
    logHeading: "5. API-Log",
    clearBtn: "Clear",
    footer1: "Testdaten, öffentlicher Server (",
    footer2: "), für jeden sichtbar — keine echten Patientendaten.",
    logEmpty: 'Noch keine Aufrufe. Klicke "Send to record".',
    sendingPatient: "Sende Patient…",
    sendingEncounter: "Sende Encounter…",
    sendingCondition: "Sende Condition…",
    sendingDocument: "Sende DocumentReference…",
    readingDocument: "Lese DocumentReference zurück…",
    errorPatient: "Fehler beim Anlegen des Patienten. Siehe Log.",
    errorEncounter: "Fehler beim Anlegen des Encounters. Siehe Log.",
    errorCondition: "Fehler beim Anlegen der Condition. Siehe Log.",
    errorDocument: "Fehler beim Anlegen der DocumentReference. Siehe Log.",
    errorRead: "Fehler beim Zurücklesen. Siehe Log.",
    doneStatus: "Fertig: Patient/%s, Encounter/%s, Condition/%s, DocumentReference/%s angelegt und erfolgreich zurückgelesen.",
    breakSending: "Sende ungültige DocumentReference (ohne status) zur Prüfung…",
    breakNetworkError: "Netzwerkfehler beim Testen. Siehe Log.",
    breakUnexpected: "Unerwartet: Server hat die ungültige Ressource als gültig markiert.",
    breakRejected: "Server hat die Ressource als ungültig abgelehnt, wie erwartet.",
    explainText:
      'Was gerade passiert ist: Wir haben eine Version des Dokuments gesendet, der das ' +
      'Pflichtfeld "status" absichtlich fehlt. Dieses Feld sagt einem Record-System, ob ' +
      "ein Dokument aktuell ist, ersetzt wurde oder versehentlich angelegt wurde – echte " +
      "Systeme brauchen das, um zu wissen, ob sie dem Dokument trauen können. Der Server " +
      "hat das sofort erkannt und das Dokument abgelehnt – genau das sollte passieren: Ein " +
      "System, das fehlerhafte Daten stillschweigend akzeptiert, ist weit gefährlicher als " +
      "eines, das sie klar ablehnt. Um das in der Praxis zu beheben, würde die sendende " +
      "Anwendung dieses Feld immer mitschicken, und eine Integration würde genau diese Art " +
      "von Prüfung (genannt $validate) durchführen, bevor etwas das Zielsystem erreicht.",
    serverDetail: " Serverdetail: %s",
    timeoutMsg: "Zeitüberschreitung: Server hat nach %ss nicht geantwortet.",
    networkErrorMsg: "Netzwerkfehler: %s",
  },
};

let currentLang = "en";

function t(key, ...args) {
  let str = translations[currentLang][key] ?? translations.en[key];
  args.forEach((arg) => {
    str = str.replace("%s", arg);
  });
  return str;
}

const noteEl = document.getElementById("note-text");
const sendBtn = document.getElementById("send-btn");
const breakBtn = document.getElementById("break-btn");
const clearLogBtn = document.getElementById("clear-log-btn");
const statusEl = document.getElementById("status-line");
const logEl = document.getElementById("log-entries");
const roundtripSection = document.getElementById("roundtrip");
const roundtripOriginal = document.getElementById("roundtrip-original");
const roundtripDecoded = document.getElementById("roundtrip-decoded");
const explainBox = document.getElementById("explain-box");
const langButtons = document.querySelectorAll(".lang-btn");
const metaDescriptionEl = document.querySelector('meta[name="description"]');

noteEl.textContent = NOTE_TEXT;

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.title = t("pageTitle");
  if (metaDescriptionEl) metaDescriptionEl.setAttribute("content", t("metaDescription"));
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  langButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
}

langButtons.forEach((btn) => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = "status-line" + (kind ? ` status-${kind}` : "");
}

function shortBody(text, max = 220) {
  if (!text) return "(empty)";
  const trimmed = text.trim();
  return trimmed.length > max ? trimmed.slice(0, max) + "…" : trimmed;
}

function logEntry({ method, url, status, body, isError }) {
  const row = document.createElement("div");
  row.className = "log-row" + (isError ? " log-row-error" : "");

  const badge = document.createElement("span");
  badge.className = "log-status " + statusClass(status);
  badge.textContent = status === null ? "ERR" : String(status);

  const head = document.createElement("div");
  head.className = "log-head";
  const methodEl = document.createElement("span");
  methodEl.className = "log-method";
  methodEl.textContent = method;
  const urlEl = document.createElement("span");
  urlEl.className = "log-url";
  urlEl.textContent = url.replace(FHIR_BASE, "");
  head.append(badge, methodEl, urlEl);

  const bodyEl = document.createElement("pre");
  bodyEl.className = "log-body";
  bodyEl.textContent = shortBody(body);

  row.append(head, bodyEl);
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

function statusClass(status) {
  if (status === null) return "log-status-error";
  if (status >= 200 && status < 300) return "log-status-ok";
  if (status >= 400) return "log-status-fail";
  return "log-status-other";
}

async function fhirFetch(method, path, body) {
  const url = `${FHIR_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/fhir+json;charset=utf-8",
        Accept: "application/fhir+json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = null;
    }
    logEntry({ method, url, status: res.status, body: text });
    return { ok: res.ok, status: res.status, json, text };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err.name === "AbortError";
    const message = isAbort
      ? t("timeoutMsg", REQUEST_TIMEOUT_MS / 1000)
      : t("networkErrorMsg", err.message);
    logEntry({ method, url, status: null, body: message, isError: true });
    return { ok: false, status: null, json: null, text: message, networkError: true };
  }
}

function generateRunId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function buildPatient(runId) {
  return {
    resourceType: "Patient",
    identifier: [
      { system: "urn:note-to-record:demo-mrn", value: `DEMO-${runId}` },
    ],
    name: [{ use: "official", family: "Mustermann", given: ["Erika"] }],
    gender: "female",
    birthDate: "1975-03-14",
  };
}

function buildEncounter(patientId) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    resourceType: "Encounter",
    status: "finished",
    class: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "AMB",
            display: "ambulatory",
          },
        ],
      },
    ],
    subject: { reference: `Patient/${patientId}` },
    period: { start: `${today}T09:00:00+02:00`, end: `${today}T09:20:00+02:00` },
  };
}

function buildCondition(patientId, encounterId) {
  return {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: "confirmed",
        },
      ],
    },
    code: {
      coding: [
        {
          system: ICD10GM_SYSTEM,
          version: "2026",
          code: "M54.50",
          display: "Kreuzschmerz, nicht näher bezeichnet",
        },
      ],
      text: "Akute unspezifische lumbale Rückenschmerzen",
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
  };
}

function buildDocumentReference(patientId, encounterId, noteText, { omitStatus = false } = {}) {
  const doc = {
    resourceType: "DocumentReference",
    status: "current",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11488-4",
          display: "Consult note",
        },
      ],
    },
    subject: { reference: `Patient/${patientId}` },
    content: [
      {
        attachment: {
          contentType: "text/plain;charset=utf-8",
          data: utf8ToBase64(noteText),
          title: "Konsultationsnotiz",
        },
      },
    ],
  };
  if (encounterId) {
    doc.context = { encounter: [{ reference: `Encounter/${encounterId}` }] };
  }
  if (omitStatus) {
    delete doc.status;
  }
  return doc;
}

function validationErrorIssues(result) {
  const issues = result.json && result.json.resourceType === "OperationOutcome" ? result.json.issue || [] : [];
  return issues.filter((i) => i.severity === "error" || i.severity === "fatal");
}

function plainErrorExplanation(errorIssues) {
  const diagnostics = errorIssues.map((i) => i.diagnostics).filter(Boolean).join(" ");
  return t("explainText") + (diagnostics ? t("serverDetail", diagnostics) : "");
}

async function handleSend() {
  sendBtn.disabled = true;
  breakBtn.disabled = true;
  roundtripSection.classList.add("hidden");
  explainBox.classList.add("hidden");
  setStatus(t("sendingPatient"), "pending");

  const runId = generateRunId();
  const patientRes = await fhirFetch("POST", "/Patient", buildPatient(runId));
  if (!patientRes.ok) {
    setStatus(t("errorPatient"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const patientId = patientRes.json.id;

  setStatus(t("sendingEncounter"), "pending");
  const encounterRes = await fhirFetch("POST", "/Encounter", buildEncounter(patientId));
  if (!encounterRes.ok) {
    setStatus(t("errorEncounter"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const encounterId = encounterRes.json.id;

  setStatus(t("sendingCondition"), "pending");
  const conditionRes = await fhirFetch("POST", "/Condition", buildCondition(patientId, encounterId));
  if (!conditionRes.ok) {
    setStatus(t("errorCondition"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const conditionId = conditionRes.json.id;

  setStatus(t("sendingDocument"), "pending");
  const docRes = await fhirFetch(
    "POST",
    "/DocumentReference",
    buildDocumentReference(patientId, encounterId, NOTE_TEXT)
  );
  if (!docRes.ok) {
    setStatus(t("errorDocument"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const docId = docRes.json.id;

  setStatus(t("readingDocument"), "pending");
  const readRes = await fhirFetch("GET", `/DocumentReference/${docId}`);
  if (!readRes.ok) {
    setStatus(t("errorRead"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }

  const decodedText = base64ToUtf8(readRes.json.content[0].attachment.data);
  roundtripOriginal.textContent = NOTE_TEXT;
  roundtripDecoded.textContent = decodedText;
  roundtripSection.classList.remove("hidden");

  setStatus(t("doneStatus", patientId, encounterId, conditionId, docId), "ok");
  sendBtn.disabled = false;
  breakBtn.disabled = false;
}

async function handleBreak() {
  sendBtn.disabled = true;
  breakBtn.disabled = true;
  explainBox.classList.add("hidden");
  setStatus(t("breakSending"), "pending");

  const badDoc = buildDocumentReference("example", null, NOTE_TEXT, { omitStatus: true });
  const result = await fhirFetch("POST", "/DocumentReference/$validate", badDoc);

  if (result.networkError) {
    setStatus(t("breakNetworkError"), "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }

  const errorIssues = validationErrorIssues(result);
  if (errorIssues.length === 0) {
    setStatus(t("breakUnexpected"), "fail");
  } else {
    setStatus(t("breakRejected"), "fail");
    explainBox.textContent = plainErrorExplanation(errorIssues);
    explainBox.classList.remove("hidden");
  }

  sendBtn.disabled = false;
  breakBtn.disabled = false;
}

sendBtn.addEventListener("click", handleSend);
breakBtn.addEventListener("click", handleBreak);
clearLogBtn.addEventListener("click", () => {
  logEl.innerHTML = "";
});

setLanguage("en");
