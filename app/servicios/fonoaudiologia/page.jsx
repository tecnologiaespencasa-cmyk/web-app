import Image from "next/image";
import RevealOnScroll from "../../components/RevealOnScroll";
import ScrollCtaLink from "../../components/ScrollCtaLink";
import styles from "./page.module.css";

const careFocus = [
  "Evaluación de habla, lenguaje, voz y audición en el entorno del hogar.",
  "Intervención terapéutica en pronunciación, fluidez y comprensión verbal.",
  "Acompañamiento para deglución funcional y segura según condición clínica.",
  "Plan de ejercicios en casa para paciente, familia y cuidador principal.",
];

const careRoute = [
  {
    step: "01",
    title: "Valoramos",
    text: "Identificamos necesidades comunicativas y funcionales de cada paciente.",
  },
  {
    step: "02",
    title: "Diseñamos",
    text: "Definimos un plan terapéutico con objetivos claros y progresivos.",
  },
  {
    step: "03",
    title: "Acompañamos",
    text: "Realizamos sesiones domiciliarias con seguimiento continuo del avance.",
  },
  {
    step: "04",
    title: "Consolidamos",
    text: "Ajustamos el plan para sostener resultados y fortalecer autonomía.",
  },
];

export const metadata = {
  title: "Fonoaudiología | Especialistas En Casa",
  description:
    "Servicio de fonoaudiología domiciliaria para lenguaje, audición, voz y deglución con enfoque humano y clínico.",
};

export default function FonoaudiologiaPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="fonoaudiologia-title">
        <RevealOnScroll className={styles.heroCopy} delay={80}>
          <p className={styles.kicker}>Fonoaudiología</p>
          <h1 id="fonoaudiologia-title">
            Comunicación, audición y lenguaje con terapia cercana en casa.
          </h1>
          <p className={styles.heroLead}>
            Brindamos atención fonoaudiológica integral para niños, adultos y
            personas mayores, con intervenciones personalizadas orientadas a
            mejorar funcionalidad y calidad de vida.
          </p>

          <div className={styles.heroActions}>
            <ScrollCtaLink targetId="enfoque-title" className={styles.primaryAction}>
              Ver enfoque terapéutico
            </ScrollCtaLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroVisual} delay={140} variant="scale">
          <figure className={styles.heroImageWrap}>
            <Image
              src="/fonoaudiologia/fonoaudiologia-auditiva.jpg"
              alt="Evaluación auditiva con otoscopio durante consulta fonoaudiológica"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 48vw"
              className={`${styles.image} ${styles.heroImage}`}
            />
          </figure>
        </RevealOnScroll>
      </section>

      <section className={styles.focusSection} aria-labelledby="enfoque-title">
        <RevealOnScroll className={styles.focusMedia} delay={100} variant="scale">
          <figure className={styles.focusImageWrap}>
            <Image
              src="/fonoaudiologia/fonoaudiologia-lenguaje.jpg"
              alt="Terapia de lenguaje infantil guiada por profesional"
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
              className={styles.image}
            />
          </figure>
        </RevealOnScroll>

        <RevealOnScroll className={styles.focusCopy} delay={160}>
          <p className={styles.sectionTag}>Enfoque integral</p>
          <h2 id="enfoque-title">
            Intervención terapéutica para escuchar mejor, expresarse con claridad y
            comunicarse con confianza.
          </h2>
          <p className={styles.sectionLead}>
            El servicio integra valoración clínica, actividades terapéuticas y
            educación familiar para lograr avances sostenibles en el entorno
            cotidiano del paciente.
          </p>

          <div className={styles.focusList}>
            {careFocus.map((item) => (
              <article key={item} className={styles.focusItem}>
                <span aria-hidden="true" className={styles.focusMark}>
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className={styles.routeSection} aria-labelledby="ruta-title">
        <RevealOnScroll className={styles.routeHeader} delay={90}>
          <p className={styles.sectionTag}>Ruta de atención</p>
          <h2 id="ruta-title">Proceso estructurado para resultados medibles.</h2>
          <p className={styles.sectionLead}>
            Cada sesión se ajusta a la evolución del paciente para avanzar con
            objetivos concretos y acompañamiento continuo.
          </p>
        </RevealOnScroll>

        <div className={styles.routeGrid}>
          {careRoute.map((item, index) => (
            <RevealOnScroll
              key={item.step}
              delay={130 + index * 80}
              variant={index % 2 === 0 ? "up" : "scale"}
            >
              <article className={styles.routeCard}>
                <span className={styles.routeStep}>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </main>
  );
}
