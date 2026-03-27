import Image from "next/image";
import RevealOnScroll from "../../components/RevealOnScroll";
import ScrollCtaLink from "../../components/ScrollCtaLink";
import styles from "./page.module.css";

const includedCare = [
  "Valoración inicial del paciente y revisión del contexto del hogar.",
  "Seguimiento de signos vitales y respuesta al tratamiento.",
  "Intervenciones de enfermería según plan clínico.",
  "Administración de medicamentos cuando aplica.",
  "Educación al cuidador principal y red de apoyo.",
  "Coordinación para continuidad asistencial.",
];

const protocol = [
  {
    label: "01",
    title: "Valoramos",
    text: "Comprendemos la necesidad asistencial y las condiciones del entorno domiciliario.",
  },
  {
    label: "02",
    title: "Organizamos",
    text: "Definimos una ruta de cuidado clara para cada fase del acompañamiento.",
  },
  {
    label: "03",
    title: "Acompañamos",
    text: "Realizamos seguimiento clínico y cuidados en casa con enfoque humano.",
  },
  {
    label: "04",
    title: "Damos continuidad",
    text: "Dejamos orientaciones y pasos siguientes para sostener el bienestar del paciente.",
  },
];

export const metadata = {
  title: "Hospitalización en casa | Especialistas En Casa",
  description:
    "Apartado de Hospitalización en casa con enfoque en acompañamiento familiar y vigilancia clínica.",
};

export default function HospitalizacionEnCasaPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hospitalizacion-title">
        <RevealOnScroll className={styles.heroIntro} delay={80}>
          <p className={styles.kicker}>Hospitalización en casa</p>
          <h1 id="hospitalizacion-title">
            Recuperación en casa con cuidado cercano, seguro y acompañado.
          </h1>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroLeadWrap} delay={120}>
          <p className={styles.heroLead}>
            Este servicio está pensado para pacientes que necesitan continuidad
            asistencial en el hogar, con una experiencia que combina seguimiento
            clínico, observación constante y tranquilidad para la familia.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroVisual} delay={140} variant="scale">
          <figure className={styles.heroImageWrap}>
            <Image
              src="/hospitalizacion/hospitalizacion-hero.png"
              alt="Profesional de salud acompañando a un paciente durante hospitalización en casa"
              fill
              priority
              sizes="(max-width: 760px) 34vw, (max-width: 980px) 100vw, 46vw"
              className={`${styles.image} ${styles.heroImage}`}
            />
          </figure>
        </RevealOnScroll>

        <RevealOnScroll className={styles.actionRow} delay={160}>
          <ScrollCtaLink
            targetId="acompanamiento-title"
            className={styles.secondaryAction}
          >
            Ver detalle del servicio
          </ScrollCtaLink>
        </RevealOnScroll>
      </section>

      <section className={styles.storySection} aria-labelledby="acompanamiento-title">
        <RevealOnScroll className={styles.storyMedia} delay={100} variant="scale">
          <figure className={styles.storyImageWrap}>
            <Image
              src="/hospitalizacion/hospitalizacion-manos.jpg"
              alt="Manos entrelazadas durante un proceso de cuidado y acompañamiento"
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
              className={styles.image}
            />
          </figure>
        </RevealOnScroll>

        <RevealOnScroll className={styles.storyCopy} delay={160}>
          <p className={styles.sectionTag}>Acompañamiento humano</p>
          <h2 id="acompanamiento-title">
            El cuidado empieza en la confianza que siente el paciente dentro de su
            propio hogar.
          </h2>
          <p className={styles.sectionLead}>
            Hospitalización en casa no solo implica intervenciones clínicas.
            También significa presencia, orientación y una experiencia más
            serena para quien recibe la atención y para su familia.
          </p>

          <div className={styles.storyQuote}>
            "La cercanía humana transforma la experiencia del tratamiento."
          </div>

          <div className={styles.checkList}>
            {includedCare.map((item) => (
              <article key={item} className={styles.checkItem}>
                <span aria-hidden="true" className={styles.checkMark}>
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className={styles.monitorSection} aria-labelledby="monitor-title">
        <RevealOnScroll className={styles.monitorCopy} delay={80}>
          <p className={styles.sectionTag}>Vigilancia clínica</p>
          <h2 id="monitor-title">
            Seguimiento, observación y respuesta oportuna dentro del entorno
            domiciliario.
          </h2>
          <p className={styles.sectionLead}>
            El monitoreo de signos y la evaluación permanente de la evolución
            ayudan a sostener una atención organizada, segura y alineada con el
            plan terapéutico.
          </p>

          <div className={styles.protocolList}>
            {protocol.map((item, index) => (
              <RevealOnScroll
                key={item.label}
                delay={150 + index * 80}
                variant={index % 2 === 0 ? "up" : "scale"}
              >
                <article className={styles.protocolCard}>
                  <span className={styles.protocolNumber}>{item.label}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.monitorMedia} delay={180} variant="scale">
          <figure className={styles.monitorImageWrap}>
            <Image
              src="/hospitalizacion/hospitalizacion-signos.jpg"
              alt="Seguimiento de signos vitales durante atención de hospitalización en casa"
              fill
              sizes="(max-width: 980px) 100vw, 38vw"
              className={styles.image}
            />
          </figure>

          <div className={styles.monitorNote}>
            <strong>Observación constante</strong>
            <p>
              Una toma de signos bien integrada al proceso aporta claridad,
              tranquilidad y continuidad al cuidado.
            </p>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}
