import Image from "next/image";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Contacto | Especialistas En Casa",
  description: "Formulario de contacto de Especialistas En Casa",
};

export default function ContactoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.bannerSection} aria-label="Banner de contacto">
        <Image
          src="/Contacto/banner-contacto2.png"
          alt="Profesional de salud brindando atención domiciliaria"
          width={1920}
          height={700}
          priority
          className={styles.bannerImage}
        />
      </section>

      <section className={styles.contactWindow}>
        <div className={styles.introPanel}>
          <p className={styles.kicker}>Contacto directo</p>
          <h1 className={styles.title}>Cuéntanos cómo podemos ayudarte:</h1>
          <p className={styles.description}>
            Si deseas que nuestro equipo te contacte, completa el formulario y
            nosotros nos encargamos de llamarte.
          </p>
          <ul className={styles.featureList}>
            <li>Estamos aquí para atenderte.</li>
            <li>Respuesta humana y cercana.</li>
            <li>Atención personalizada</li>
          </ul>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}

