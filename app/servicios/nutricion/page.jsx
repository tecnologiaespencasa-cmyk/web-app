import Image from "next/image";
import RevealOnScroll from "../../components/RevealOnScroll";
import ScrollCtaLink from "../../components/ScrollCtaLink";
import styles from "./page.module.css";

const outcomes = [
  "Valoración nutricional integral en casa.",
  "Plan de alimentación ajustado a diagnóstico y estilo de vida.",
  "Educación al paciente y cuidador para continuidad del tratamiento.",
  "Seguimiento de avance y ajustes según evolución clínica.",
];

const process = [
  {
    step: "01",
    title: "Evaluamos",
    text: "Identificamos necesidades nutricionales, riesgos y objetivos terapéuticos.",
  },
  {
    step: "02",
    title: "Diseñamos",
    text: "Construimos una estrategia de alimentación personalizada y sostenible.",
  },
  {
    step: "03",
    title: "Acompañamos",
    text: "Monitoreamos cambios clínicos y reforzamos hábitos con apoyo cercano.",
  },
  {
    step: "04",
    title: "Consolidamos",
    text: "Ajustamos el plan para mantener resultados y mejorar calidad de vida.",
  },
];

export const metadata = {
  title: "Nutrición | Especialistas En Casa",
  description:
    "Servicio de nutrición domiciliaria con enfoque clínico, humano y personalizado.",
};

export default function NutricionPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="nutricion-title">
        <RevealOnScroll className={styles.heroCopy} delay={70}>
          <p className={styles.kicker}>Nutrición domiciliaria</p>
          <h1 id="nutricion-title">
            Alimentación terapéutica en casa para cuidar salud, energía y bienestar.
          </h1>
          <p className={styles.heroLead}>
            Nuestro servicio de nutrición integra criterio clínico y acompañamiento
            humano para que cada paciente reciba un plan realista, seguro y
            adaptado a su contexto familiar.
          </p>

          <div className={styles.heroActions}>
            <ScrollCtaLink targetId="enfoque-title" className={styles.primaryAction}>
              Ver enfoque nutricional
            </ScrollCtaLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroVisual} delay={130} variant="scale">
          <figure className={styles.heroImageWrap}>
            <Image
              src="/nutricion/nutricion-corazon.png"
              alt="Alimentos saludables formando un corazón sobre mesa"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 46vw"
              className={`${styles.image} ${styles.heroImage}`}
            />
          </figure>
        </RevealOnScroll>
      </section>

      <section className={styles.focusSection} aria-labelledby="enfoque-title">
        <RevealOnScroll className={styles.focusMedia} delay={100} variant="scale">
          <figure className={styles.focusImageWrap}>
            <Image
              src="/nutricion/nutricion-acompanamiento.jpg"
              alt="Consulta de nutrición con orientación personalizada"
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
              className={styles.image}
            />
          </figure>
        </RevealOnScroll>

        <RevealOnScroll className={styles.focusCopy} delay={140}>
          <p className={styles.sectionTag}>Enfoque clínico</p>
          <h2 id="enfoque-title">
            Acompañamiento nutricional para prevenir, recuperar y sostener resultados.
          </h2>
          <p className={styles.sectionLead}>
            Trabajamos desde una mirada integral: diagnóstico, metas por etapas y
            educación alimentaria para que el plan sea aplicable en la rutina del
            hogar.
          </p>

          <div className={styles.outcomeList}>
            {outcomes.map((item) => (
              <article key={item} className={styles.outcomeItem}>
                <span aria-hidden="true" className={styles.outcomeMark}>
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
          <h2 id="ruta-title">Proceso claro, medible y centrado en cada paciente.</h2>
          <p className={styles.sectionLead}>
            Cada fase del servicio está pensada para generar adherencia, mejorar el
            estado nutricional y fortalecer la autonomía en decisiones alimentarias.
          </p>
        </RevealOnScroll>

        <div className={styles.routeGrid}>
          {process.map((item, index) => (
            <RevealOnScroll
              key={item.step}
              className={styles.routeCardWrap}
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
