const FHIR_BASE = "https://hapi.fhir.org/baseR4";
const REQUEST_TIMEOUT_MS = 15000;

const NOTE_TEXT = `Patientin: Erika Mustermann
Geburtsdatum: 14.03.1975
Geschlecht: weiblich
Termin: 07.10.2026, Hausarztpraxis Dr. Keller

Anamnese: Patientin berichtet über seit 3 Tagen bestehende Schmerzen im unteren Rücken, aufgetreten nach Gartenarbeit. Keine Ausstrahlung in die Beine, kein Taubheitsgefühl, keine Blasen- oder Darmstörung.

Untersuchung: Klopfschmerz über der LWS, Bewegungseinschränkung bei Flexion, Lasègue-Zeichen beidseits negativ, Fußpulse tastbar.

Beurteilung: Akute unspezifische lumbale Rückenschmerzen (ICD-10 M54.5).

Therapie: Ibuprofen 400 mg bei Bedarf, lokale Wärmeanwendung, Bewegung statt Schonung empfohlen.

Wiedervorstellung bei Beschwerdepersistenz über 2 Wochen oder neurologischen Ausfällen.`;

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

noteEl.textContent = NOTE_TEXT;

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
  if (!text) return "(leer)";
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
      ? `Zeitüberschreitung: Server hat nach ${REQUEST_TIMEOUT_MS / 1000}s nicht geantwortet.`
      : `Netzwerkfehler: ${err.message}`;
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
  return (
    "Der Server hat das Dokument als ungültig markiert, weil das Pflichtfeld \"status\" fehlt " +
    "(es muss z. B. \"current\" sein, um zu sagen, dass die Notiz aktuell und gültig ist). " +
    "Ein Integrationsteam würde das beheben, indem die sendende Anwendung dieses Feld " +
    "immer mitschickt und die Notiz erst nach einer $validate-Prüfung wie dieser an das " +
    "Zielsystem sendet." +
    (diagnostics ? ` Serverdetail: ${diagnostics}` : "")
  );
}

async function handleSend() {
  sendBtn.disabled = true;
  breakBtn.disabled = true;
  roundtripSection.classList.add("hidden");
  explainBox.classList.add("hidden");
  setStatus("Sende Patient…", "pending");

  const runId = generateRunId();
  const patientRes = await fhirFetch("POST", "/Patient", buildPatient(runId));
  if (!patientRes.ok) {
    setStatus("Fehler beim Anlegen des Patienten. Siehe Log.", "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const patientId = patientRes.json.id;

  setStatus("Sende Encounter…", "pending");
  const encounterRes = await fhirFetch("POST", "/Encounter", buildEncounter(patientId));
  if (!encounterRes.ok) {
    setStatus("Fehler beim Anlegen des Encounters. Siehe Log.", "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const encounterId = encounterRes.json.id;

  setStatus("Sende DocumentReference…", "pending");
  const docRes = await fhirFetch(
    "POST",
    "/DocumentReference",
    buildDocumentReference(patientId, encounterId, NOTE_TEXT)
  );
  if (!docRes.ok) {
    setStatus("Fehler beim Anlegen der DocumentReference. Siehe Log.", "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }
  const docId = docRes.json.id;

  setStatus("Lese DocumentReference zurück…", "pending");
  const readRes = await fhirFetch("GET", `/DocumentReference/${docId}`);
  if (!readRes.ok) {
    setStatus("Fehler beim Zurücklesen. Siehe Log.", "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }

  const decodedText = base64ToUtf8(readRes.json.content[0].attachment.data);
  roundtripOriginal.textContent = NOTE_TEXT;
  roundtripDecoded.textContent = decodedText;
  roundtripSection.classList.remove("hidden");

  setStatus(
    `Fertig: Patient/${patientId}, Encounter/${encounterId}, DocumentReference/${docId} angelegt und erfolgreich zurückgelesen.`,
    "ok"
  );
  sendBtn.disabled = false;
  breakBtn.disabled = false;
}

async function handleBreak() {
  sendBtn.disabled = true;
  breakBtn.disabled = true;
  explainBox.classList.add("hidden");
  setStatus("Sende ungültige DocumentReference (ohne status) zur Prüfung…", "pending");

  const badDoc = buildDocumentReference("example", null, NOTE_TEXT, { omitStatus: true });
  const result = await fhirFetch("POST", "/DocumentReference/$validate", badDoc);

  if (result.networkError) {
    setStatus("Netzwerkfehler beim Testen. Siehe Log.", "fail");
    sendBtn.disabled = false;
    breakBtn.disabled = false;
    return;
  }

  const errorIssues = validationErrorIssues(result);
  if (errorIssues.length === 0) {
    setStatus("Unerwartet: Server hat die ungültige Ressource als gültig markiert.", "fail");
  } else {
    setStatus("Server hat die Ressource als ungültig abgelehnt, wie erwartet.", "fail");
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
