import styles from "./page.module.css";


export default function Home() {
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <div className={styles.logoWrap}>
          <img className={styles.logo} src="/logo.png" alt="Especialistas En Casa" />
        </div>

        <h1 className={styles.title}>Estamos renovando nuestro sitio web</h1>

        <p className={styles.text}>
          En Especialistas En Casa estamos trabajando en una nueva experiencia digital
          <br />
          más moderna, rápida y segura para nuestros usuarios.
        </p>

        <p className={styles.text}>
          Pronto estaremos nuevamente en línea con mejoras importantes.
        </p>

        <p className={styles.footer}>Especialistas En Casa – Salud Domiciliaria</p>
      </section>
    </main>
  );
}