import Image from "next/image";
import RevealOnScroll from "../../components/RevealOnScroll";
import ScrollCtaLink from "../../components/ScrollCtaLink";
import styles from "./page.module.css";

const includedCare = [
  "Valoración integral de la herida y del estado general del paciente.",
  "Curación avanzada con técnica segura y materiales adecuados.",
  "Control de signos de infección y evolución del tejido.",
  "Educación al cuidador para continuidad del manejo en casa.",
];

const careRoute = [
  {
    step: "01",
    title: "Valoramos",
    text: "Analizamos tipo de herida, factores de riesgo y necesidades del hogar.",
  },
  {
    step: "02",
    title: "Planificamos",
    text: "Definimos frecuencia de curaciones y objetivos terapéuticos por etapa.",
  },
  {
    step: "03",
    title: "Intervenimos",
    text: "Realizamos curación domiciliaria con seguimiento clínico continuo.",
  },
  {
    step: "04",
    title: "Prevenimos",
    text: "Fortalecemos autocuidado y medidas para evitar nuevas complicaciones.",
  },
];

export const metadata = {
  title: "Cuidado Integral de las Heridas | Especialistas En Casa",
  description:
    "Servicio domiciliario de cuidado integral de heridas con enfoque clínico, seguimiento y acompañamiento humano.",
};

export default function CuidadoIntegralHeridasPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="heridas-title">
        <RevealOnScroll className={styles.heroCopy} delay={80}>
          <p className={styles.kicker}>Cuidado integral de heridas</p>
          <h1 id="heridas-title">
            Curación segura en casa para proteger piel, salud y bienestar.
          </h1>
          <p className={styles.heroLead}>
            Acompañamos al paciente con manejo profesional de heridas agudas y
            crónicas, control de evolución y una atención cercana que reduce riesgos
            y mejora la recuperación.
          </p>

          <div className={styles.heroActions}>
            <ScrollCtaLink targetId="ruta-title" className={styles.primaryAction}>
              Ver ruta de curación
            </ScrollCtaLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroVisual} delay={150} variant="scale">
          <figure className={styles.heroImageWrap}>
            <Image
              src="/cuidado-heridas/cuidado-heridas-hero.png"
              alt="Profesional de salud realizando curación de herida en el hogar"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 48vw"
              className={`${styles.image} ${styles.heroImage}`}
            />
          </figure>
        </RevealOnScroll>
      </section>

      <section className={styles.focusSection} aria-labelledby="enfoque-title">
        <RevealOnScroll className={styles.focusMedia} delay={110} variant="scale">
          <figure className={styles.focusImageWrap}>
            <Image
              src="/cuidado-heridas/cuidado-heridas-curacion.jpg"
              alt="Aplicación de apósito durante una curación de herida"
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
              className={styles.image}
            />
          </figure>
        </RevealOnScroll>

        <RevealOnScroll className={styles.focusCopy} delay={170}>
          <p className={styles.sectionTag}>Enfoque clínico</p>
          <h2 id="enfoque-title">
            Atención especializada para cicatrizar mejor y prevenir complicaciones.
          </h2>
          <p className={styles.sectionLead}>
            Cada visita integra valoración, intervención y educación para sostener
            resultados en el tiempo, con protocolos seguros adaptados a la condición
            del paciente.
          </p>

          <div className={styles.focusList}>
            {includedCare.map((item) => (
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
          <h2 id="ruta-title">Proceso estructurado para una recuperación progresiva.</h2>
          <p className={styles.sectionLead}>
            El plan de curación se ajusta según evolución clínica, respuesta del
            tejido y condiciones del entorno domiciliario.
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