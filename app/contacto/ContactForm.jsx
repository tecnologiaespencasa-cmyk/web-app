"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ContactForm.module.css";
import {
  DOCUMENT_TYPES,
  MESSAGE_MAX_LENGTH,
  MOBILE_LENGTH,
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  REQUESTER_TYPES,
  REQUEST_TYPES,
  formatDocumentType,
  getDocumentHelp,
  getDocumentType,
  getFirstError,
  sanitizeDocumentNumber,
  sanitizeEmail,
  sanitizeMessage,
  sanitizeMobile,
  sanitizeName,
  validateContactFields,
} from "../lib/contactSchema";

const EMPTY_FORM = {
  requesterType: "",
  documentType: "",
  documentNumber: "",
  patientName: "",
  requestType: "",
  email: "",
  phone: "",
  message: "",
  dataAuthorization: false,
  website: "",
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
const DATA_AUTHORIZATION_PDF = "/documentos/autorizacion-tratamiento-datos-personales.pdf";
const DATA_POLICY_PDF = "/documentos/politica-tratamiento-datos-personales.pdf";

function sanitizeField(name, value, documentType) {
  switch (name) {
    case "patientName":
      return sanitizeName(value);
    case "documentNumber":
      return sanitizeDocumentNumber(value, documentType);
    case "phone":
      return sanitizeMobile(value);
    case "email":
      return sanitizeEmail(value);
    case "message":
      return sanitizeMessage(value);
    default:
      return value;
  }
}

function normalizeForm(formData) {
  return {
    requesterType: formData.requesterType,
    documentType: formData.documentType,
    documentNumber: formData.documentNumber.trim().toUpperCase(),
    patientName: formData.patientName.normalize("NFC").trim(),
    requestType: formData.requestType,
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    message: formData.message.normalize("NFC").trim(),
    dataAuthorization: formData.dataAuthorization === true,
  };
}

export default function ContactForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecaptchaScriptReady, setIsRecaptchaScriptReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaContainerRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.grecaptcha) {
      setIsRecaptchaScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!SITE_KEY || !isRecaptchaScriptReady || !recaptchaContainerRef.current) {
      return;
    }

    if (recaptchaWidgetIdRef.current !== null || !window.grecaptcha) {
      return;
    }

    window.grecaptcha.ready(() => {
      if (recaptchaWidgetIdRef.current !== null || !recaptchaContainerRef.current) {
        return;
      }

      recaptchaWidgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => {
          setRecaptchaToken(token);
          setStatus({ type: "idle", message: "" });
        },
        "expired-callback": () => {
          setRecaptchaToken("");
        },
        "error-callback": () => {
          setRecaptchaToken("");
          setStatus({
            type: "error",
            message: "No fue posible cargar reCAPTCHA. Intenta nuevamente.",
          });
        },
      });
    });
  }, [isRecaptchaScriptReady]);

  const normalizedForm = useMemo(() => normalizeForm(formData), [formData]);
  const errors = useMemo(() => validateContactFields(normalizedForm), [normalizedForm]);
  const selectedDocumentType = getDocumentType(formData.documentType);

  const getFieldError = (name) => (showValidation || touched[name] ? errors[name] : undefined);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    // Durante la composición (tildes con tecla muerta, teclados móviles) no se transforma el valor
    // para no interrumpir la escritura; se sanitiza al terminar (onCompositionEnd).
    const isComposing = Boolean(event.nativeEvent?.isComposing);

    setFormData((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }

      if (name === "documentType") {
        return {
          ...prev,
          documentType: value,
          documentNumber: sanitizeDocumentNumber(prev.documentNumber, value),
        };
      }

      return {
        ...prev,
        [name]: isComposing ? value : sanitizeField(name, value, prev.documentType),
      };
    });
    setStatus({ type: "idle", message: "" });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const resetRecaptcha = () => {
    if (typeof window !== "undefined" && window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
      window.grecaptcha.reset(recaptchaWidgetIdRef.current);
    }
    setRecaptchaToken("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowValidation(true);

    if (!SITE_KEY) {
      setStatus({
        type: "error",
        message: "Verificación de seguridad no disponible. Contacta al administrador.",
      });
      return;
    }

    const firstError = getFirstError(errors);
    if (firstError) {
      setStatus({ type: "error", message: firstError.message });
      document.getElementById(firstError.field)?.focus();
      return;
    }

    if (formData.website.trim()) {
      return;
    }

    if (!recaptchaToken) {
      setStatus({
        type: "error",
        message: "Debes completar reCAPTCHA antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...normalizedForm,
          website: formData.website.trim(),
          recaptchaToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: "error",
          message: payload.message || "No se pudo enviar la información. Intenta nuevamente.",
        });
        resetRecaptcha();
        return;
      }

      setStatus({ type: "idle", message: "" });
      setIsSuccessModalOpen(true);
      setFormData(EMPTY_FORM);
      setTouched({});
      setShowValidation(false);
      resetRecaptcha();
    } catch {
      setStatus({
        type: "error",
        message: "No se pudo completar el envío por un problema de red.",
      });
      resetRecaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": Boolean(getFieldError(name)),
    "aria-describedby": getFieldError(name) ? `${name}-error` : undefined,
  });

  const renderError = (name) => {
    const error = getFieldError(name);
    return error ? (
      <p id={`${name}-error`} className={styles.fieldError}>
        {error}
      </p>
    ) : null;
  };

  return (
    <>
      {SITE_KEY ? (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setIsRecaptchaScriptReady(true)}
          onError={() =>
            setStatus({
              type: "error",
              message: "No se pudo cargar el servicio reCAPTCHA.",
            })
          }
        />
      ) : null}

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* 1. Quién realiza la solicitud */}
        <div className={styles.fieldGroup}>
          <label htmlFor="requesterType" className={styles.label}>
            ¿Quién realiza la solicitud?
          </label>
          <select
            {...fieldProps("requesterType")}
            className={`${styles.input} ${styles.select}`}
            value={formData.requesterType}
            required
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {REQUESTER_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderError("requesterType")}
        </div>

        {/* 2. Tipo y número de documento del paciente */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="documentType" className={styles.label}>
              Tipo de documento del paciente
            </label>
            <select
              {...fieldProps("documentType")}
              className={`${styles.input} ${styles.select}`}
              value={formData.documentType}
              required
            >
              <option value="" disabled>
                Selecciona el tipo
              </option>
              {DOCUMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {formatDocumentType(option)}
                </option>
              ))}
            </select>
            {renderError("documentType")}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="documentNumber" className={styles.label}>
              Número de documento
            </label>
            <input
              {...fieldProps("documentNumber")}
              onCompositionEnd={handleChange}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode={selectedDocumentType && !selectedDocumentType.allowsLetters ? "numeric" : "text"}
              maxLength={selectedDocumentType?.maxLength}
              className={styles.input}
              placeholder={selectedDocumentType?.allowsLetters ? "Ej: AB123456" : "Ej: 1020304050"}
              value={formData.documentNumber}
              disabled={!selectedDocumentType}
              aria-describedby={getFieldError("documentNumber") ? "documentNumber-error" : "documentNumber-help"}
              required
            />
            {renderError("documentNumber") || (
              <p id="documentNumber-help" className={styles.fieldHelp}>
                {getDocumentHelp(selectedDocumentType)}
              </p>
            )}
          </div>
        </div>

        {/* 3. Nombre del paciente */}
        <div className={styles.fieldGroup}>
          <label htmlFor="patientName" className={styles.label}>
            Nombre completo del paciente
          </label>
          <input
            {...fieldProps("patientName")}
            onCompositionEnd={handleChange}
            type="text"
            autoComplete={formData.requesterType === "paciente" ? "name" : "off"}
            className={styles.input}
            placeholder="Ej: María Fernanda Castro Peña"
            value={formData.patientName}
            maxLength={NAME_MAX_LENGTH}
            required
          />
          {renderError("patientName")}
        </div>

        {/* 4. Tipo de solicitud */}
        <div className={styles.fieldGroup}>
          <label htmlFor="requestType" className={styles.label}>
            Tipo de solicitud
          </label>
          <select
            {...fieldProps("requestType")}
            className={`${styles.input} ${styles.select}`}
            value={formData.requestType}
            required
          >
            <option value="" disabled>
              Selecciona el tipo de solicitud
            </option>
            {REQUEST_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderError("requestType")}
        </div>

        {/* 5. Correo electrónico */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo electrónico
          </label>
          <input
            {...fieldProps("email")}
            onCompositionEnd={handleChange}
            type="text"
            autoComplete="email"
            inputMode="email"
            maxLength={EMAIL_MAX_LENGTH}
            className={styles.input}
            placeholder="Ej: nombre@dominio.com"
            value={formData.email}
            required
          />
          {renderError("email")}
        </div>

        {/* 6. Número de celular */}
        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Número de celular
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={MOBILE_LENGTH}
            className={styles.input}
            placeholder="Ej: 3001234567"
            value={formData.phone}
            required
          />
          {renderError("phone")}
        </div>

        {/* 7. Observaciones o mensaje */}
        <div className={styles.fieldGroup}>
          <label htmlFor="message" className={styles.label}>
            Observaciones o mensaje
          </label>
          <textarea
            {...fieldProps("message")}
            onCompositionEnd={handleChange}
            className={styles.textarea}
            placeholder="Describe tu solicitud con el mayor detalle posible"
            value={formData.message}
            maxLength={MESSAGE_MAX_LENGTH}
            required
          />
          {renderError("message") || (
            <p className={styles.fieldHelp}>
              {formData.message.length}/{MESSAGE_MAX_LENGTH} caracteres.
            </p>
          )}
        </div>

        {/* Autorización de tratamiento de datos personales (Ley 1581 de 2012) */}
        <div className={styles.consentBox}>
          <label htmlFor="dataAuthorization" className={styles.consentLabel}>
            <input
              {...fieldProps("dataAuthorization")}
              type="checkbox"
              className={styles.checkbox}
              checked={formData.dataAuthorization}
              required
            />
            <span>
              Autorizo de manera previa, expresa e informada a Especialistas En Casa (NIT 901154675-0) para tratar
              los datos personales suministrados en este formulario, incluidos los datos sensibles relacionados con
              la salud, con el fin de gestionar y dar respuesta a esta solicitud, conforme a la Ley 1581 de 2012, la{" "}
              <a href={DATA_AUTHORIZATION_PDF} target="_blank" rel="noopener noreferrer">
                autorización para el tratamiento de datos personales
              </a>{" "}
              y la{" "}
              <a href={DATA_POLICY_PDF} target="_blank" rel="noopener noreferrer">
                política de tratamiento de datos personales
              </a>
              . Si diligencio la solicitud en nombre del paciente, declaro que estoy facultado(a) para suministrar
              sus datos.
            </span>
          </label>
          {renderError("dataAuthorization")}
        </div>

        <div className={styles.captchaBox}>
          <p className={styles.captchaTitle}>Verificación de seguridad con reCAPTCHA</p>
          <p className={styles.captchaHint}>Marca la casilla para confirmar que no eres un bot.</p>
          <div className={styles.recaptchaFrame}>
            <div ref={recaptchaContainerRef} />
          </div>

          {showValidation && !recaptchaToken ? (
            <p className={styles.errorText}>Completa reCAPTCHA para habilitar el envío.</p>
          ) : null}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting || !SITE_KEY}>
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>

        {status.message ? (
          <p className={styles.errorText} role="status">
            {status.message}
          </p>
        ) : null}
      </form>

      {isSuccessModalOpen ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setIsSuccessModalOpen(false)}>
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalCheckCircle} aria-hidden="true">
              <span className={styles.modalCheck}>✓</span>
            </div>
            <p id="contact-success-title" className={styles.modalText}>
              Solicitud enviada correctamente. Recibirás un correo de confirmación y nuestro equipo de Atención al
              Usuario te contactará pronto.
            </p>
            <button
              type="button"
              className={styles.modalButton}
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
