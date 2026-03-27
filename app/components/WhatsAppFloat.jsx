import Image from "next/image";
import styles from "./WhatsAppFloat.module.css";

const whatsappUrl = "https://wa.me/573054573413";

export default function WhatsAppFloat() {
  return (
    <div className={styles.wrapper}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className={styles.button}
        aria-label={"Abrir chat de WhatsApp con Atenci\u00f3n al usuario"}
        title={"Atenci\u00f3n al usuario"}
      >
        <span className={styles.ring} aria-hidden="true" />
        <span className={styles.imageShell} aria-hidden="true">
          <Image
            src="/whatsapp/WhatsApp2.jpg"
            alt=""
            fill
            sizes="160px"
            className={styles.image}
            priority
          />
        </span>
      </a>
      <p className={styles.label}>{"Atenci\u00f3n al usuario"}</p>
    </div>
  );
}
