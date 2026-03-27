import Image from "next/image";
import RevealOnScroll from "../../components/RevealOnScroll";
import ScrollCtaLink from "../../components/ScrollCtaLink";
import styles from "./page.module.css";

const physicalFocus = [
  "Movilidad articular y flexibilidad funcional.",
  "Fortalecimiento progresivo según la condición del paciente.",
  "Reeducación de postura, marcha y equilibrio.",
  "Prevención de dolor y recaídas en casa.",
];

const respiratoryFocus = [
  "Técnicas para mejorar ventilación y expansión pulmonar.",
  "Manejo de secreciones y higiene bronquial.",
  "Entrenamiento respiratorio para tolerancia al esfuerzo.",
  "Educación para paciente y cuidador en el hogar.",
];

const careRoute = [
  {
    step: "01",
    title: "Valoración integral",
    text: "Definimos estado funcional, objetivos y nivel de acompañamiento necesario.",
  },
  {
    step: "02",
    title: "Plan terapéutico",
    text: "Estructuramos sesiones personalizadas con metas medibles y realistas.",
  },
  {
    step: "03",
    title: "Seguimiento en casa",
    text: "Ajustamos ejercicios y técnicas según avance clínico y respuesta del paciente.",
  },
  {
    step: "04",
    title: "Continuidad segura",
    text: "Entregamos pautas para sostener resultados y reducir riesgo de complicaciones.",
  },
];

export const metadata = {
  title: "Terapia Física y Respiratoria | Especialistas En Casa",
  description:
    "Atención domiciliaria de terapia física y respiratoria con enfoque funcional, humano y seguro.",
};

export default function TerapiaFisicaRespiratoriaPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="terapia-title">
        <RevealOnScroll className={styles.heroCopy} delay={80}>
          <p className={styles.kicker}>Terapia física y respiratoria</p>
          <h1 id="terapia-title">
            Recuperación activa en casa, guiada paso a paso por profesionales.
          </h1>
          <p className={styles.heroLead}>
            Integramos movimiento terapéutico y cuidado respiratorio para mejorar
            autonomía, aliviar síntomas y fortalecer la calidad de vida de cada
            paciente.
          </p>

          <div className={styles.heroActions}>
            <ScrollCtaLink targetId="plan-title" className={styles.primaryAction}>
              Conocer el plan de atención
            </ScrollCtaLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.heroVisual} delay={150} variant="scale">
          <figure className={styles.heroImageWrap}>
            <Image
              src="/terapia-fisica-respiratoria/terapia-hero-bandas.jpg"
              alt="Sesión de fortalecimiento con banda elástica en terapia física domiciliaria"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 48vw"
              className={styles.image}
            />
          </figure>

          <div className={styles.heroHalo} aria-hidden="true" />
        </RevealOnScroll>
      </section>

      <section className={styles.dualTrackSection} aria-labelledby="enfoque-title">
        <RevealOnScroll className={styles.trackHeader} delay={90}>
          <p className={styles.sectionTag}>Enfoque terapéutico</p>
          <h2 id="enfoque-title">
            Dos rutas complementarias para recuperar función y mejorar respiración.
          </h2>
        </RevealOnScroll>

        <div className={styles.trackGrid}>
          <RevealOnScroll className={styles.trackCard} delay={120} variant="up">
            <figure className={styles.trackImageWrap}>
              <Image
                src="/terapia-fisica-respiratoria/terapia-estiramiento-guiado.jpg"
                alt="Paciente realizando estiramiento guiado junto a terapeuta"
                fill
                sizes="(max-width: 980px) 100vw, 44vw"
                className={styles.image}
              />
            </figure>

            <div className={styles.trackBody}>
              <p className={styles.trackLabel}>Terapia física</p>
              <h3>Movilidad, fuerza y equilibrio para la vida diaria.</h3>
              <div className={styles.bulletList}>
                {physicalFocus.map((item) => (
                  <article key={item} className={styles.bulletItem}>
                    <span aria-hidden="true" className={styles.dot} />
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className={styles.trackCard} delay={160} variant="scale">
            <figure className={styles.trackImageWrap}>
              <Image
                src="/terapia-fisica-respiratoria/terapia-respiratoria-nebulizacion.png"
                alt="Acompañamiento de terapia respiratoria con nebulización domiciliaria"
                fill
                sizes="(max-width: 980px) 100vw, 44vw"
                className={styles.image}
              />
            </figure>

            <div className={styles.trackBody}>
              <p className={styles.trackLabel}>Terapia respiratoria</p>
              <h3>Respirar mejor para avanzar con mayor seguridad.</h3>
              <div className={styles.bulletList}>
                {respiratoryFocus.map((item) => (
                  <article key={item} className={styles.bulletItem}>
                    <span aria-hidden="true" className={styles.dot} />
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className={styles.protocolSection} aria-labelledby="plan-title">
        <RevealOnScroll className={styles.protocolCopy} delay={90}>
          <p className={styles.sectionTag}>Ruta de atención</p>
          <h2 id="plan-title">
            Trabajo terapéutico con objetivos claros y seguimiento continuo.
          </h2>
          <p className={styles.sectionLead}>
            Cada fase busca mejorar independencia funcional y controlar síntomas
            respiratorios, con un plan que se adapta a la evolución real del
            paciente en su hogar.
          </p>

          <div className={styles.protocolList}>
            {careRoute.map((item, index) => (
              <RevealOnScroll
                key={item.step}
                delay={140 + index * 80}
                variant={index % 2 === 0 ? "up" : "scale"}
              >
                <article className={styles.protocolItem}>
                  <span className={styles.stepBadge}>{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className={styles.protocolMedia} delay={170} variant="scale">
          <figure className={styles.protocolImageWrap}>
            <Image
              src="/terapia-fisica-respiratoria/terapia-fuerza-coordinacion.jpg"
              alt="Ejercicios de coordinacion y fuerza en proceso de rehabilitacion"
              fill
              sizes="(max-width: 980px) 100vw, 40vw"
              className={styles.image}
            />
          </figure>

          <article className={styles.noteCard}>
            <p className={styles.noteTitle}>Atención segura en casa</p>
            <p>
              El plan terapéutico se desarrolla con acompañamiento profesional y
              orientaciones prácticas para paciente, familia y cuidador.
            </p>
          </article>
        </RevealOnScroll>
      </section>
    </main>
  );
}
