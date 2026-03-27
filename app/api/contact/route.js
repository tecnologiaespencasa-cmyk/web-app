import { NextResponse } from "next/server";

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const PHONE_REGEX = /^\d{7,10}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/;
const ALLOWED_FIELDS = new Set(["fullName", "phone", "email", "website", "recaptchaToken"]);

const MAX_CONTENT_LENGTH_BYTES = 2 * 1024;
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

  return jsonResponse({
    ok: true,
    message: "Mensaje enviado. Pronto te contactaremos.",
  });
}

