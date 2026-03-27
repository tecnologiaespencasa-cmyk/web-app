import { NextResponse } from "next/server";

export const runtime = "nodejs";

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const PHONE_REGEX = /^\d{7,10}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/;
const REQUEST_REASON_REGEX = /^[A-Za-z0-9@._\-\s]+$/;
const ALLOWED_FIELDS = new Set(["fullName", "phone", "email", "requestReason", "website", "recaptchaToken"]);
const CONTACT_RECIPIENT = "liderdetecnologia@especialistasencasa.com";
const CONTACT_SUBJECT = "Solicitud vía pagina web.";

const MAX_CONTENT_LENGTH_BYTES = 10 * 1024;
const MAX_REQUESTS_PER_WINDOW = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

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
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
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

function isRequestOriginAllowed(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function hasUnexpectedFields(payload) {
  return Object.keys(payload).some((field) => !ALLOWED_FIELDS.has(field));
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

function buildMailText({ fullName, phone, email, requestReason, clientIp }) {
  const submittedAt = new Date().toISOString();
  const ipLabel = clientIp && clientIp !== "unknown" ? clientIp : "No disponible";

  return [
    "Nueva solicitud vía página web",
    "",
    `Nombre completo: ${fullName}`,
    `Teléfono: ${phone}`,
    `Correo electrónico: ${email}`,
    `Motivo de la solicitud: ${requestReason}`,
    `IP: ${ipLabel}`,
    `Fecha (ISO): ${submittedAt}`,
  ].join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildMailHtml({ fullName, phone, email, requestReason, clientIp }) {
  const submittedAt = new Date().toISOString();
  const ipLabel = clientIp && clientIp !== "unknown" ? clientIp : "No disponible";

  return `
    <h2 style="margin:0 0 12px;">Nueva solicitud vía página web</h2>
    <p style="margin:0 0 6px;"><strong>Nombre completo:</strong> ${escapeHtml(fullName)}</p>
    <p style="margin:0 0 6px;"><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
    <p style="margin:0 0 6px;"><strong>Correo electrónico:</strong> ${escapeHtml(email)}</p>
    <p style="margin:0 0 6px;"><strong>Motivo de la solicitud:</strong> ${escapeHtml(requestReason)}</p>
    <p style="margin:0 0 6px;"><strong>IP:</strong> ${escapeHtml(ipLabel)}</p>
    <p style="margin:0;"><strong>Fecha (ISO):</strong> ${escapeHtml(submittedAt)}</p>
  `;
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
    tokenResponse = await fetch(tokenUrl, {
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

async function sendGraphMail({ accessToken, senderEmail, fullName, phone, email, requestReason, clientIp }) {
  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`;
  const mailPayload = {
    message: {
      subject: CONTACT_SUBJECT,
      body: {
        contentType: "HTML",
        content: buildMailHtml({ fullName, phone, email, requestReason, clientIp }),
      },
      toRecipients: [
        {
          emailAddress: {
            address: CONTACT_RECIPIENT,
          },
        },
      ],
      replyTo: [
        {
          emailAddress: {
            address: email,
          },
        },
      ],
    },
    saveToSentItems: false,
  };

  let sendResponse;
  try {
    sendResponse = await fetch(sendMailUrl, {
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

  if (!isRequestOriginAllowed(request)) {
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
    body = await request.json();
  } catch {
    return jsonError("Solicitud inválida.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Formato de solicitud inválido.");
  }

  if (hasUnexpectedFields(body)) {
    return jsonError("Solicitud no permitida.");
  }

  const fullName = String(body?.fullName || "").trim();
  const phone = String(body?.phone || "").trim();
  const email = String(body?.email || "").trim();
  const requestReason = String(body?.requestReason || "").trim();
  const website = String(body?.website || "").trim();
  const recaptchaToken = String(body?.recaptchaToken || "").trim();

  if (website.length > 0) {
    return jsonError("Solicitud rechazada.");
  }

  if (fullName.length < 3 || fullName.length > 80 || !NAME_REGEX.test(fullName)) {
    return jsonError("El nombre solo puede contener letras y espacios.");
  }

  if (!PHONE_REGEX.test(phone)) {
    return jsonError("El teléfono debe tener entre 7 y 10 dígitos.");
  }

  if (email.length > 80 || !EMAIL_REGEX.test(email)) {
    return jsonError("El correo solo permite letras, números y los caracteres @ . _ -");
  }

  if (
    requestReason.length < 10 ||
    requestReason.length > 600 ||
    !REQUEST_REASON_REGEX.test(requestReason)
  ) {
    return jsonError("El motivo debe tener de 10 a 600 caracteres y solo usar letras, números, espacios y @ . _ -");
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
    verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
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

  const graphConfig = getGraphConfig();
  if (!graphConfig) {
    return jsonError("Configuración de correo incompleta.", 500);
  }

  const tokenResult = await requestGraphAccessToken(graphConfig);
  if (!tokenResult.ok) {
    console.error("Error obteniendo token de Graph:", tokenResult.details || tokenResult.message);
    return jsonError("No fue posible enviar la solicitud en este momento. Intenta nuevamente.", 502);
  }

  const sendResult = await sendGraphMail({
    accessToken: tokenResult.accessToken,
    senderEmail: graphConfig.senderEmail,
    fullName,
    phone,
    email,
    requestReason,
    clientIp,
  });

  if (!sendResult.ok) {
    console.error("Error enviando con Graph:", sendResult.details || sendResult.message);
    return jsonError("No fue posible enviar la solicitud en este momento. Intenta nuevamente.", 502);
  }

  return jsonResponse({
    ok: true,
    message: "Solicitud enviada correctamente.",
  });
}
