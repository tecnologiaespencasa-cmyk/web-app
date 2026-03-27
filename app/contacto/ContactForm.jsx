"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ContactForm.module.css";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  website: "",
};

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const PHONE_REGEX = /^\d{7,10}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/;
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function ContactForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ type: "idle", message: "" });
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

  const isNameValid = useMemo(() => NAME_REGEX.test(formData.fullName.trim()), [formData.fullName]);
  const isPhoneValid = useMemo(() => PHONE_REGEX.test(formData.phone.trim()), [formData.phone]);
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email.trim()), [formData.email]);

  const canSubmit = useMemo(
    () =>
      isNameValid &&
      isPhoneValid &&
      isEmailValid &&
      !formData.website.trim() &&
      Boolean(recaptchaToken) &&
      Boolean(SITE_KEY) &&
      !isSubmitting,
    [formData.website, isEmailValid, isNameValid, isPhoneValid, isSubmitting, recaptchaToken],
  );

  const updateField = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "fullName") {
      value = value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ").slice(0, 80);
    }

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "email") {
      const compact = value.replace(/\s/g, "");
      const allowedChars = compact.replace(/[^A-Za-z0-9._@-]/g, "");
      const firstAtIndex = allowedChars.indexOf("@");

      if (firstAtIndex === -1) {
        value = allowedChars;
      } else {
        const localPart = allowedChars.slice(0, firstAtIndex + 1);
        const domainPart = allowedChars.slice(firstAtIndex + 1).replace(/@/g, "");
        value = `${localPart}${domainPart}`;
      }

      value = value.slice(0, 80);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "idle", message: "" });
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

    if (!isNameValid) {
      setStatus({
        type: "error",
        message: "El nombre solo puede contener letras y espacios.",
      });
      return;
    }

    if (!isPhoneValid) {
      setStatus({
        type: "error",
        message: "El teléfono debe tener entre 7 y 10 dígitos numéricos.",
      });
      return;
    }

    if (!isEmailValid) {
      setStatus({
        type: "error",
        message: "El correo solo permite letras, números y los caracteres @ . _ -",
      });
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
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
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

      setStatus({
        type: "success",
        message: payload.message || "Mensaje enviado. Pronto te contactaremos.",
      });
      setFormData(EMPTY_FORM);
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
            onChange={updateField}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="fullName" className={styles.label}>
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            className={styles.input}
            placeholder="Ej: María Fernanda Castro"
            value={formData.fullName}
            onChange={updateField}
            pattern="[A-Za-z]+(?:\\s+[A-Za-z]+)*"
            maxLength={80}
            aria-invalid={showValidation && !isNameValid}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Número de teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            pattern="\\d{7,10}"
            minLength={7}
            maxLength={10}
            className={styles.input}
            placeholder="Ej: 3001234567"
            value={formData.phone}
            onChange={updateField}
            aria-invalid={showValidation && !isPhoneValid}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="email"
            pattern="[A-Za-z0-9._-]+@[A-Za-z0-9._-]+"
            maxLength={80}
            className={styles.input}
            placeholder="Ej: usuario_test@dominio.com"
            value={formData.email}
            onChange={updateField}
            aria-invalid={showValidation && !isEmailValid}
            required
          />
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

        <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
          {isSubmitting ? "Enviando..." : "Enviar información"}
        </button>

        {status.message ? (
          <p className={status.type === "success" ? styles.successText : styles.errorText} role="status">
            {status.message}
          </p>
        ) : null}
      </form>
    </>
  );
}

