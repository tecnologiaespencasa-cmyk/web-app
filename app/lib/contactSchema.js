/**
 * Esquema compartido del formulario de contacto (PQRSF).
 * Lo usan el formulario (cliente) y la API (servidor) para que las reglas sean idénticas.
 * No debe importar nada exclusivo de Node ni del navegador.
 */

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 80;
export const MOBILE_LENGTH = 10;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 1000;

// Letras del español: A-Z, vocales con tilde, diéresis y ñ (mayúsculas y minúsculas).
const LETTERS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";

const NAME_REGEX = new RegExp(`^[${LETTERS}]+(?: [${LETTERS}]+)*$`);
const NAME_DISALLOWED_CHARS = new RegExp(`[^${LETTERS} ]`, "g");

// Mensaje: letras (con tildes y ñ), números, espacios, saltos de línea y puntuación básica.
// Se excluyen < > { } [ ] \ | $ & * = + ^ ~ ` para reducir riesgo de inyección.
const MESSAGE_ALLOWED_CHARS = `${LETTERS}0-9 \\n\\r.,;:¿?¡!()\\-_@#/°'"%`;
const MESSAGE_REGEX = new RegExp(`^[${MESSAGE_ALLOWED_CHARS}]+$`);
const MESSAGE_DISALLOWED_CHARS = new RegExp(`[^${MESSAGE_ALLOWED_CHARS}]`, "g");

const EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// Celular colombiano: 10 dígitos y empieza por 3.
const MOBILE_REGEX = /^3\d{9}$/;

export const REQUESTER_TYPES = [
  { value: "paciente", label: "Soy el paciente" },
  { value: "familiar", label: "Soy familiar del paciente" },
];

export const REQUESTER_TYPE_EMAIL_LABELS = {
  paciente: "El paciente",
  familiar: "Un familiar del paciente",
};

/**
 * Tipos de documento (códigos del sector salud, Circular Externa 24 de 2019 de MinSalud
 * y Resolución 2275 de 2023). Registro civil, Pasaporte y Documento de identificación
 * extranjero admiten letras (alfanuméricos según la Circular 24 de 2019); los demás son
 * exclusivamente numéricos.
 */
export const DOCUMENT_TYPES = [
  { value: "CC", abbreviation: "CC", label: "Cédula de ciudadanía", allowsLetters: false, minLength: 3, maxLength: 10 },
  { value: "TI", abbreviation: "TI", label: "Tarjeta de identidad", allowsLetters: false, minLength: 10, maxLength: 11 },
  { value: "RC", abbreviation: "RC", label: "Registro civil de nacimiento", allowsLetters: true, minLength: 6, maxLength: 11 },
  { value: "CE", abbreviation: "CE", label: "Cédula de extranjería", allowsLetters: false, minLength: 3, maxLength: 10 },
  { value: "PT", abbreviation: "PPT", label: "Permiso por Protección Temporal", allowsLetters: false, minLength: 4, maxLength: 8 },
  { value: "PE", abbreviation: "PEP", label: "Permiso Especial de Permanencia", allowsLetters: false, minLength: 15, maxLength: 15 },
  { value: "PA", abbreviation: "PA", label: "Pasaporte", allowsLetters: true, minLength: 4, maxLength: 16 },
  { value: "DE", abbreviation: "DE", label: "Documento de identificación extranjero", allowsLetters: true, minLength: 4, maxLength: 16 },
];

export function formatDocumentType(documentType) {
  return documentType ? `${documentType.label} (${documentType.abbreviation})` : "";
}

export const DOCUMENT_MAX_LENGTH = Math.max(...DOCUMENT_TYPES.map((type) => type.maxLength));

export const REQUEST_TYPES = [
  { value: "peticion", label: "Petición" },
  { value: "queja", label: "Queja" },
  { value: "reclamo", label: "Reclamo" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "felicitacion", label: "Felicitación" },
];

/** Orden en que se muestran los campos (y en que se reporta el primer error). */
export const FIELD_ORDER = [
  "requesterType",
  "documentType",
  "documentNumber",
  "patientName",
  "requestType",
  "email",
  "phone",
  "message",
  "dataAuthorization",
];

export function getDocumentType(code) {
  return DOCUMENT_TYPES.find((type) => type.value === code) || null;
}

export function getRequestType(code) {
  return REQUEST_TYPES.find((type) => type.value === code) || null;
}

function lengthLabel(min, max, unit) {
  return min === max ? `${min} ${unit}` : `entre ${min} y ${max} ${unit}`;
}

function getDocumentRegex(documentType) {
  const charset = documentType.allowsLetters ? "A-Z0-9" : "0-9";
  return new RegExp(`^[${charset}]{${documentType.minLength},${documentType.maxLength}}$`);
}

export function getDocumentHelp(documentType) {
  if (!documentType) {
    return "Primero selecciona el tipo de documento.";
  }

  return documentType.allowsLetters
    ? `Solo letras y números, sin espacios ni caracteres especiales (${lengthLabel(documentType.minLength, documentType.maxLength, "caracteres")}).`
    : `Solo números, sin puntos, espacios ni guiones (${lengthLabel(documentType.minLength, documentType.maxLength, "dígitos")}).`;
}

/* ---------- Sanitizadores (se usan mientras el usuario escribe) ---------- */

export function sanitizeName(value) {
  return String(value)
    .normalize("NFC")
    .replace(NAME_DISALLOWED_CHARS, "")
    .replace(/ {2,}/g, " ")
    .replace(/^ /, "")
    .slice(0, NAME_MAX_LENGTH);
}

export function sanitizeDocumentNumber(value, documentTypeCode) {
  const documentType = getDocumentType(documentTypeCode);
  const maxLength = documentType ? documentType.maxLength : DOCUMENT_MAX_LENGTH;
  const allowsLetters = documentType ? documentType.allowsLetters : true;
  const cleaned = allowsLetters
    ? String(value).replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    : String(value).replace(/\D/g, "");
  return cleaned.slice(0, maxLength);
}

export function sanitizeMobile(value) {
  return String(value).replace(/\D/g, "").slice(0, MOBILE_LENGTH);
}

export function sanitizeEmail(value) {
  const allowedChars = String(value).replace(/[^A-Za-z0-9._@-]/g, "");
  const firstAtIndex = allowedChars.indexOf("@");
  const normalized =
    firstAtIndex === -1
      ? allowedChars
      : `${allowedChars.slice(0, firstAtIndex + 1)}${allowedChars.slice(firstAtIndex + 1).replace(/@/g, "")}`;
  return normalized.slice(0, EMAIL_MAX_LENGTH);
}

export function sanitizeMessage(value) {
  return String(value)
    .normalize("NFC")
    .replace(/\t/g, " ")
    .replace(MESSAGE_DISALLOWED_CHARS, "")
    .slice(0, MESSAGE_MAX_LENGTH);
}

/* ---------- Validación (cliente y servidor) ---------- */

/**
 * Valida los datos ya normalizados (trim + NFC). Devuelve un objeto { campo: mensaje }
 * con los errores encontrados; vacío si todo es válido.
 */
export function validateContactFields(fields) {
  const errors = {};

  if (!REQUESTER_TYPES.some((type) => type.value === fields.requesterType)) {
    errors.requesterType = "Indica si eres el paciente o un familiar del paciente.";
  }

  const documentType = getDocumentType(fields.documentType);
  if (!documentType) {
    errors.documentType = "Selecciona el tipo de documento del paciente.";
  }

  if (!fields.documentNumber) {
    errors.documentNumber = "Ingresa el número de documento del paciente.";
  } else if (documentType && !getDocumentRegex(documentType).test(fields.documentNumber)) {
    errors.documentNumber = `Número de documento inválido para ${documentType.label}. ${getDocumentHelp(documentType)}`;
  }

  const patientName = fields.patientName || "";
  if (
    patientName.length < NAME_MIN_LENGTH ||
    patientName.length > NAME_MAX_LENGTH ||
    !NAME_REGEX.test(patientName)
  ) {
    errors.patientName = "El nombre del paciente solo puede contener letras (incluidas tildes y ñ) y espacios.";
  }

  if (!getRequestType(fields.requestType)) {
    errors.requestType = "Selecciona el tipo de solicitud.";
  }

  const email = fields.email || "";
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
    errors.email = "Ingresa un correo válido (ej: nombre@dominio.com).";
  }

  if (!MOBILE_REGEX.test(fields.phone || "")) {
    errors.phone = "El número de celular debe tener 10 dígitos y empezar por 3.";
  }

  const message = fields.message || "";
  if (message.length < MESSAGE_MIN_LENGTH || message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `El mensaje debe tener entre ${MESSAGE_MIN_LENGTH} y ${MESSAGE_MAX_LENGTH} caracteres.`;
  } else if (!MESSAGE_REGEX.test(message)) {
    errors.message = "El mensaje contiene caracteres no permitidos (< > { } [ ] \\ | $ & * = + ^ ~).";
  }

  if (fields.dataAuthorization !== true) {
    errors.dataAuthorization = "Debes autorizar el tratamiento de datos personales para enviar la solicitud.";
  }

  return errors;
}

export function getFirstError(errors) {
  const field = FIELD_ORDER.find((name) => errors[name]);
  return field ? { field, message: errors[field] } : null;
}
