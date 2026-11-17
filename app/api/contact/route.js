import { NextResponse } from "next/server";
import {
  REQUESTER_TYPE_EMAIL_LABELS,
  formatDocumentType,
  getDocumentType,
  getFirstError,
  getRequestType,
  validateContactFields,
} from "../../lib/contactSchema";

export const runtime = "nodejs";

const TEXT_FIELDS = [
  "requesterType",
  "documentType",
  "documentNumber",
  "patientName",
  "requestType",
  "email",
  "phone",
  "message",
  "website",
  "recaptchaToken",
];
const ALLOWED_FIELDS = new Set([...TEXT_FIELDS, "dataAuthorization"]);
const CONTACT_RECIPIENT = "atencionusuario@especialistasencasa.com";
const CONTACT_CC_RECIPIENTS = [
  "lideratencionusuario@especialistasencasa.com",
  "direccionasistencial@especialistasencasa.com",
];
const CONTACT_SUBJECT = "Nueva solicitud de contacto vía página web";
const USER_CONFIRMATION_SUBJECT = "Recibimos tu solicitud de contacto";
const ATTENTION_LINE = "604 3222498";
const USER_CONFIRMATION_LOGO_CID = "especialistas-en-casa-logo";
const USER_CONFIRMATION_LOGO_RELATIVE_PATH = ["public", "logo2.png"];

const MAX_CONTENT_LENGTH_BYTES = 10 * 1024;
const MAX_REQUESTS_PER_WINDOW = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;
const RATE_LIMITER_MAX_ENTRIES = 5000;
const EXTERNAL_REQUEST_TIMEOUT_MS = 10 * 1000;
const IP_REGEX = /^[0-9A-Fa-f:.]{3,45}$/;

const rateLimiterStore = globalThis.__contactRateLimiterStore || new Map();
if (!globalThis.__contactRateLimiterStore) {
  globalThis.__contactRateLimiterStore = rateLimiterStore;
}

function jsonResponse(payload, status = 200, headers = {}) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function jsonError(message, status = 400, headers = {}) {
  return jsonResponse({ ok: false, message }, status, headers);
}

function getClientIp(request) {
  // x-real-ip lo fija la plataforma (Vercel/proxy) y el cliente no puede falsificarlo;
  // x-forwarded-for queda solo como respaldo.
  const candidates = [
    request.headers.get("x-real-ip"),
    String(request.headers.get("x-forwarded-for") || "").split(",")[0],
  ];

  for (const candidate of candidates) {
    const ip = String(candidate || "").trim();
    if (IP_REGEX.test(ip)) {
      return ip;
    }
  }

  return "unknown";
}

function cleanupRateLimiter(now) {
  for (const [ip, entry] of rateLimiterStore.entries()) {
    const expiredWindow = now - entry.windowStart > RATE_LIMIT_WINDOW_MS;
    const expiredBlock = !entry.blockedUntil || now >= entry.blockedUntil;
    if (expiredWindow && expiredBlock) {
      rateLimiterStore.delete(ip);
    }
  }

  // Evita crecimiento ilimitado de memoria ante ataques con muchas IP distintas.
  while (rateLimiterStore.size >= RATE_LIMITER_MAX_ENTRIES) {
    const oldestKey = rateLimiterStore.keys().next().value;
    rateLimiterStore.delete(oldestKey);
  }
}

function enforceRateLimit(ip) {
  const now = Date.now();
  cleanupRateLimiter(now);

  const entry = rateLimiterStore.get(ip);
  if (!entry) {
    rateLimiterStore.set(ip, {
      count: 1,
      windowStart: now,
      blockedUntil: 0,
    });
    return { allowed: true };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    entry.blockedUntil = 0;
    rateLimiterStore.set(ip, entry);
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimiterStore.set(ip, entry);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  rateLimiterStore.set(ip, entry);
  return { allowed: true };
}

/**
 * Devuelve el hostname del origen si la petición proviene del mismo sitio; en otro caso null.
 * Los navegadores siempre envían Origin en peticiones POST, por lo que su ausencia
 * indica un cliente no legítimo (script, bot) y se rechaza.
 */
function getAllowedOriginHostname(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return null;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return null;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host ? originUrl.hostname : null;
  } catch {
    return null;
  }
}

function hasUnexpectedFields(payload) {
  return Object.keys(payload).some((field) => !ALLOWED_FIELDS.has(field));
}

/**
 * Lee los campos de texto esperados. Devuelve null si alguno no es string
 * (evita confusión de tipos con arreglos u objetos).
 */
function readTextFields(payload) {
  const fields = {};
  for (const field of TEXT_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null) {
      fields[field] = "";
      continue;
    }
    if (typeof value !== "string") {
      return null;
    }
    fields[field] = value.trim();
  }
  return fields;
}

function fetchWithTimeout(url, options) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(EXTERNAL_REQUEST_TIMEOUT_MS),
  });
}

function getGraphConfig() {
  const tenantId = String(process.env.GRAPH_TENANT_ID || "").trim();
  const clientId = String(process.env.GRAPH_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.GRAPH_CLIENT_SECRET || "").trim();
  const senderEmail = String(process.env.GRAPH_SENDER_EMAIL || "").trim();

  if (!tenantId || !clientId || !clientSecret || !senderEmail) {
    return null;
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    senderEmail,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSubmittedLabels() {
  const submittedAtDate = new Date();
  return {
    local: new Intl.DateTimeFormat("es-CO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(submittedAtDate),
  };
}

function buildMailRow(label, valueHtml, isFirst) {
  const border = isFirst ? "" : "border-top:1px solid #eef0f3;";
  return `
              <tr>
                <td style="padding:11px 14px;background:#fafafa;color:#4a5567;font-size:13px;font-weight:700;width:34%;vertical-align:top;${border}">${label}</td>
                <td style="padding:11px 14px;color:#1f2430;font-size:13px;line-height:1.5;${border}">${valueHtml}</td>
              </tr>`;
}

function buildInternalMailHtml(submission) {
  const rows = [
    ["¿Quién realiza la solicitud?", escapeHtml(submission.requesterLabel)],
    ["Tipo de documento del paciente", escapeHtml(submission.documentTypeLabel)],
    ["Número de documento", escapeHtml(submission.documentNumber)],
    ["Nombre del paciente", escapeHtml(submission.patientName)],
    ["Tipo de solicitud", `<strong>${escapeHtml(submission.requestTypeLabel)}</strong>`],
    ["Correo electrónico", escapeHtml(submission.email)],
    ["Número de celular", escapeHtml(submission.phone)],
    ["Observaciones o mensaje", escapeHtml(submission.message).replace(/\r?\n/g, "<br />")],
    ["Autorización de tratamiento de datos personales", "Aceptada (Ley 1581 de 2012)"],
    ["Fecha (CO)", escapeHtml(submission.submittedAt.local)],
  ];

  return `
    <div style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:22px 28px;background:#e80115;">
            <p style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;font-weight:700;">Nueva solicitud de contacto: ${escapeHtml(submission.requestTypeLabel)}</p>
            <p style="margin:6px 0 0;color:#ffe5e8;font-size:13px;line-height:1.5;">Formulario enviado desde la página web</p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 28px 12px;">
            <p style="margin:0 0 14px;color:#1f2430;font-size:14px;line-height:1.6;">
              Se registró una nueva solicitud. A continuación, los datos enviados por el usuario:
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;border:1px solid #eef0f3;border-radius:10px;overflow:hidden;">
              ${rows.map(([label, valueHtml], index) => buildMailRow(label, valueHtml, index === 0)).join("")}
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildInternalMailMessage(submission) {
  const { email } = submission;
  return {
    // Se conserva el asunto base (posibles reglas de Outlook) y se agrega el tipo de solicitud.
    subject: `${CONTACT_SUBJECT} - ${submission.requestTypeLabel}`,
    body: {
      contentType: "HTML",
      content: buildInternalMailHtml(submission),
    },
    toRecipients: [
      {
        emailAddress: {
          address: CONTACT_RECIPIENT,
        },
      },
    ],
    ccRecipients: CONTACT_CC_RECIPIENTS.map((address) => ({
      emailAddress: {
        address,
      },
    })),
    replyTo: [
      {
        emailAddress: {
          address: email,
        },
      },
    ],
  };
}

// Seguridad/privacidad: el correo de confirmación va a una dirección que el usuario escribe
// y que no está verificada. Por eso NO se repite aquí el mensaje ni el documento:
// evita que el formulario se use para enviar texto arbitrario (phishing) desde el dominio
// de la empresa y que información de salud llegue a un tercero si el correo está mal escrito.
// Solo se saluda por nombre cuando quien escribe es el propio paciente.
function buildUserConfirmationMailHtml({ greetingName, requestTypeLabel, submittedAt, includeInlineLogo }) {
  const greeting = greetingName ? `Hola <strong>${escapeHtml(greetingName)}</strong>,` : "Hola,";
  const logoBlock = includeInlineLogo
    ? `<img src="cid:${USER_CONFIRMATION_LOGO_CID}" alt="Especialistas En Casa" width="240" style="max-width:100%;height:auto;border:0;display:inline-block;" />`
    : `<p style="margin:0;font-size:26px;font-weight:700;line-height:1.1;color:#e80115;">Especialistas En Casa</p>`;

  return `
    <div style="margin:0;padding:24px;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:24px 32px 16px;text-align:center;background:#ffffff;border-bottom:1px solid #f0f2f5;">
            ${logoBlock}
          </td>
        </tr>
        <tr>
          <td style="padding:26px 32px 12px;">
            <p style="margin:0 0 14px;color:#1f2430;font-size:16px;line-height:1.6;">${greeting}</p>
            <p style="margin:0 0 14px;color:#4a5567;font-size:15px;line-height:1.7;">
              Hemos recibido correctamente tu solicitud de tipo <strong>${escapeHtml(requestTypeLabel)}</strong>, enviada el <strong>${escapeHtml(submittedAt.local)}</strong>.
            </p>
            <p style="margin:0 0 16px;color:#4a5567;font-size:15px;line-height:1.7;">
              Nuestro equipo de Atención al Usuario revisará tu información y se comunicará contigo a la mayor brevedad posible.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 12px;">
            <p style="margin:0 0 10px;color:#1f2430;font-size:15px;font-weight:700;">Canales de comunicación</p>
            <p style="margin:0 0 8px;color:#4a5567;font-size:14px;line-height:1.6;">
              Línea de atención al usuario:
              <a href="tel:${ATTENTION_LINE.replace(/\s+/g, "")}" style="color:#e80115;text-decoration:none;font-weight:700;">${ATTENTION_LINE}</a>
            </p>
            <p style="margin:0 0 16px;color:#4a5567;font-size:14px;line-height:1.6;">
              Correo:
              <a href="mailto:${CONTACT_RECIPIENT}" style="color:#e80115;text-decoration:none;font-weight:700;">${CONTACT_RECIPIENT}</a>
            </p>
            <p style="margin:0;color:#4a5567;font-size:14px;line-height:1.7;">
              Gracias por confiar en Especialistas En Casa. Es un gusto acompañarte en tu proceso de atención domiciliaria.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px;background:#fafafa;border-top:1px solid #f0f2f5;">
            <p style="margin:0;color:#7a8699;font-size:12px;line-height:1.6;">
              Este es un mensaje automático de confirmación. Si necesitas atención inmediata, por favor utiliza nuestros canales oficiales.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

let userConfirmationLogoBase64 = null;
let userConfirmationLogoLoaded = false;

async function getUserConfirmationLogoBase64() {
  if (userConfirmationLogoLoaded) {
    return userConfirmationLogoBase64;
  }

  try {
    const [{ readFile }, pathModule] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const logoAbsolutePath = pathModule.join(process.cwd(), ...USER_CONFIRMATION_LOGO_RELATIVE_PATH);
    const logoBuffer = await readFile(logoAbsolutePath);
    userConfirmationLogoBase64 = logoBuffer.toString("base64");
  } catch (error) {
    console.error("No se pudo cargar el logo para el correo de confirmación:", error);
    userConfirmationLogoBase64 = null;
  } finally {
    userConfirmationLogoLoaded = true;
  }

  return userConfirmationLogoBase64;
}

async function buildUserConfirmationMailMessage({ greetingName, requestTypeLabel, email, submittedAt }) {
  const logoBase64 = await getUserConfirmationLogoBase64();
  const hasLogo = Boolean(logoBase64);
  const message = {
    subject: USER_CONFIRMATION_SUBJECT,
    body: {
      contentType: "HTML",
      content: buildUserConfirmationMailHtml({
        greetingName,
        requestTypeLabel,
        submittedAt,
        includeInlineLogo: hasLogo,
      }),
    },
    toRecipients: [
      {
        emailAddress: {
          address: email,
        },
      },
    ],
    replyTo: [
      {
        emailAddress: {
          address: CONTACT_RECIPIENT,
        },
      },
    ],
  };

  if (hasLogo) {
    message.attachments = [
      {
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: "logo-especialistas-en-casa.png",
        contentType: "image/png",
        contentBytes: logoBase64,
        isInline: true,
        contentId: USER_CONFIRMATION_LOGO_CID,
      },
    ];
  }

  return message;
}

async function requestGraphAccessToken(graphConfig) {
  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(graphConfig.tenantId)}/oauth2/v2.0/token`;
  const tokenBody = new URLSearchParams({
    client_id: graphConfig.clientId,
    client_secret: graphConfig.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  let tokenResponse;
  try {
    tokenResponse = await fetchWithTimeout(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenBody.toString(),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "No fue posible conectarse con Microsoft Graph." };
  }

  const tokenPayload = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    return { ok: false, message: "No fue posible autenticarse con Microsoft Graph.", details: tokenPayload };
  }

  return { ok: true, accessToken: tokenPayload.access_token };
}

async function sendGraphMail({ accessToken, senderEmail, message }) {
  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`;
  const mailPayload = {
    message,
    saveToSentItems: false,
  };

  let sendResponse;
  try {
    sendResponse = await fetchWithTimeout(sendMailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(mailPayload),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "No fue posible enviar correo con Microsoft Graph." };
  }

  if (!sendResponse.ok) {
    const sendPayload = await sendResponse.json().catch(() => null);
    return { ok: false, message: "Microsoft Graph rechazó el envío de correo.", details: sendPayload };
  }

  return { ok: true };
}

export async function POST(request) {
  const clientIp = getClientIp(request);
  const rateLimit = enforceRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return jsonError(
      "Demasiadas solicitudes. Intenta más tarde.",
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  const originHostname = getAllowedOriginHostname(request);
  if (!originHostname) {
    return jsonError("Origen no permitido.", 403);
  }

  const contentType = String(request.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return jsonError("Tipo de contenido no permitido.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
    return jsonError("Carga demasiado grande.", 413);
  }

  let body;
  try {
    // Se lee como texto para limitar el tamaño real aunque no venga Content-Length.
    const rawBody = await request.text();
    if (rawBody.length > MAX_CONTENT_LENGTH_BYTES) {
      return jsonError("Carga demasiado grande.", 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Solicitud inválida.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Formato de solicitud inválido.");
  }

  if (hasUnexpectedFields(body)) {
    return jsonError("Solicitud no permitida.");
  }

  const fields = readTextFields(body);
  if (!fields) {
    return jsonError("Formato de solicitud inválido.");
  }

  const { website, recaptchaToken } = fields;
  if (website.length > 0) {
    return jsonError("Solicitud rechazada.");
  }

  // Normalización (NFC para tildes/ñ) y validación con las mismas reglas del formulario.
  const submissionFields = {
    requesterType: fields.requesterType,
    documentType: fields.documentType,
    documentNumber: fields.documentNumber.toUpperCase(),
    patientName: fields.patientName.normalize("NFC"),
    requestType: fields.requestType,
    email: fields.email,
    phone: fields.phone,
    message: fields.message.normalize("NFC"),
    dataAuthorization: body.dataAuthorization === true,
  };

  const firstError = getFirstError(validateContactFields(submissionFields));
  if (firstError) {
    return jsonError(firstError.message);
  }

  if (!recaptchaToken || recaptchaToken.length > 4096) {
    return jsonError("Debes completar reCAPTCHA.");
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecret) {
    return jsonError("Configuración de seguridad incompleta.", 500);
  }

  const verifyPayload = new URLSearchParams({
    secret: recaptchaSecret,
    response: recaptchaToken,
  });

  if (clientIp && clientIp !== "unknown") {
    verifyPayload.append("remoteip", clientIp);
  }

  let verifyResponse;
  try {
    verifyResponse = await fetchWithTimeout("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verifyPayload.toString(),
      cache: "no-store",
    });
  } catch {
    return jsonError("No fue posible validar reCAPTCHA. Intenta nuevamente.", 502);
  }

  if (!verifyResponse.ok) {
    return jsonError("Falló la verificación de seguridad.", 502);
  }

  const verification = await verifyResponse.json().catch(() => null);
  if (!verification?.success) {
    return jsonError("No se pudo validar reCAPTCHA.", 400);
  }

  // El token debe haberse resuelto en este mismo sitio (evita reutilizar tokens de otros dominios).
  if (String(verification.hostname || "").toLowerCase() !== originHostname.toLowerCase()) {
    console.warn("reCAPTCHA resuelto en un hostname distinto al del sitio:", verification.hostname);
    return jsonError("No se pudo validar reCAPTCHA.", 400);
  }

  const graphConfig = getGraphConfig();
  if (!graphConfig) {
    return jsonError("Configuración de correo incompleta.", 500);
  }

  const tokenResult = await requestGraphAccessToken(graphConfig);
  if (!tokenResult.ok) {
    console.error("Error obteniendo token de Graph:", tokenResult.details || tokenResult.message);
    return jsonError("No fue posible enviar la solicitud en este momento. Intenta nuevamente.", 502);
  }

  const documentType = getDocumentType(submissionFields.documentType);
  const requestTypeLabel = getRequestType(submissionFields.requestType).label;
  const submittedAt = getSubmittedLabels();
  const internalMessage = buildInternalMailMessage({
    requesterLabel: REQUESTER_TYPE_EMAIL_LABELS[submissionFields.requesterType],
    documentTypeLabel: formatDocumentType(documentType),
    documentNumber: submissionFields.documentNumber,
    patientName: submissionFields.patientName,
    requestTypeLabel,
    email: submissionFields.email,
    phone: submissionFields.phone,
    message: submissionFields.message,
    submittedAt,
  });

  const internalSendResult = await sendGraphMail({
    accessToken: tokenResult.accessToken,
    senderEmail: graphConfig.senderEmail,
    message: internalMessage,
  });

  if (!internalSendResult.ok) {
    console.error("Error enviando correo interno con Graph:", internalSendResult.details || internalSendResult.message);
    return jsonError("No fue posible enviar la solicitud en este momento. Intenta nuevamente.", 502);
  }

  const userConfirmationMessage = await buildUserConfirmationMailMessage({
    greetingName: submissionFields.requesterType === "paciente" ? submissionFields.patientName : "",
    requestTypeLabel,
    email: submissionFields.email,
    submittedAt,
  });

  const userConfirmationResult = await sendGraphMail({
    accessToken: tokenResult.accessToken,
    senderEmail: graphConfig.senderEmail,
    message: userConfirmationMessage,
  });

  if (!userConfirmationResult.ok) {
    console.error(
      "Error enviando correo de confirmación al usuario:",
      userConfirmationResult.details || userConfirmationResult.message,
    );
  }

  return jsonResponse({
    ok: true,
    message: "Solicitud enviada correctamente.",
  });
}
