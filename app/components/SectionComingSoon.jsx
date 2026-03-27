import Link from "next/link";
import styles from "./SectionComingSoon.module.css";

export default function SectionComingSoon({ title, description }) {
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>Esta página se encuentra en construcción.</p>
        <Link href="/" className={styles.backLink}>
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
