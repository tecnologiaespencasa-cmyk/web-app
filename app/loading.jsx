import Image from "next/image";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite" aria-label="Cargando página principal">
      <div className={styles.spinner}>
        <Image
          src="/isotipo-transparente.png"
          alt="Logo Especialistas en Casa"
          fill
          sizes="136px"
          className={styles.logo}
          priority
        />
      </div>
      <p className={styles.text}>Cargando...</p>
    </div>
  );
}

