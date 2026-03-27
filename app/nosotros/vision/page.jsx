import RevealOnScroll from "../../components/RevealOnScroll";
import styles from "./page.module.css";

const valueRoute = [
  {
    title: "Liderazgo en atención domiciliaria",
    text: "En 2026 buscamos consolidarnos como empresa líder del mercado en modelos integrales de atención.",
  },
  {
    title: "Engranaje organizacional",
    text: "Articulamos colaboradores, proveedores, personas y sus familias para una atención conectada y efectiva.",
  },
  {
    title: "Transformación del servicio",
    text: "Impulsamos una nueva forma de prestar servicios de salud, más humana, coordinada y sostenible.",
  },
];

const interestGroups = [
  {
    title: "Colaboradores",
    text: "Fortalecemos capacidades y trabajo en equipo para sostener un modelo integral de alto desempeño.",
  },
  {
    title: "Proveedores",
    text: "Consolidamos alianzas estratégicas que soportan oportunidad, calidad y continuidad del cuidado.",
  },
  {
    title: "Personas",
    text: "Centramos la atención en resultados en salud que respondan a las necesidades reales de cada paciente.",
  },
  {
    title: "Familias",
    text: "Integramos a la familia como parte activa del proceso para mejorar experiencia y calidad de vida.",
  },
];

const visionStatement =
  "En el 2026 consolidarnos como la empresa de salud domiciliaria líder en el mercado en modelos integrales de atención, a través del engranaje organizacional entre colaboradores, proveedores, las personas y sus familias; transformando la forma tradicional de prestar servicios de salud.";

export const metadata = {
  title: "Visión | Especialistas En Casa",
  description:
    "Visión de Especialistas En Casa: liderazgo en salud domiciliaria con modelos integrales de atención para 2026.",
};

export default function VisionPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="vision-title">
        <RevealOnScroll className={styles.heroCopy} delay={80}>
          <p className={styles.kicker}>Nosotros</p>
          <h1 id="vision-title">Visión</h1>
          <p className={styles.statement}>{visionStatement}</p>
        </RevealOnScroll>

        <RevealOnScroll className={styles.routePanel} delay={140} variant="scale">
          <p className={styles.panelTag}>Ruta estratégica</p>
          <div className={styles.routeList}>
            {valueRoute.map((item, index) => (
              <article key={item.title} className={styles.routeItem}>
                <span className={styles.routeStep}>
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className={styles.groupsSection} aria-labelledby="groups-title">
        <RevealOnScroll className={styles.groupsHeader} delay={90}>
          <p className={styles.sectionTag}>Enfoque compartido</p>
          <h2 id="groups-title">
            Proyección conjunta para transformar la atención en salud domiciliaria.
          </h2>
        </RevealOnScroll>

        <div className={styles.groupsGrid}>
          {interestGroups.map((item, index) => (
            <RevealOnScroll
              key={item.title}
              delay={140 + index * 80}
              variant={index % 2 === 0 ? "up" : "scale"}
            >
              <article className={styles.groupCard}>
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
