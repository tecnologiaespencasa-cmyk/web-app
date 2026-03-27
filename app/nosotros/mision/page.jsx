import RevealOnScroll from "../../components/RevealOnScroll";
import styles from "./page.module.css";

const valueRoute = [
  {
    title: "Amor, respeto y dedicación",
    text: "Nuestro servicio parte del cuidado humano y el compromiso permanente con cada familia.",
  },
  {
    title: "Procesos ágiles y seguros",
    text: "Respondemos con oportunidad y calidad para proteger al paciente en cada etapa de la atención.",
  },
  {
    title: "Impacto para todos",
    text: "Integramos personas, colaboradores y aliados estratégicos para generar resultados sostenibles.",
  },
];

const interestGroups = [
  {
    title: "Personas y familias",
    text: "Atención domiciliaria que mejora bienestar, adherencia y confianza en el tratamiento.",
  },
  {
    title: "Colaboradores",
    text: "Un entorno de trabajo coordinado, humano y orientado al crecimiento profesional.",
  },
  {
    title: "Aliados estratégicos",
    text: "Relacionamos experiencia clínica y eficiencia operativa para resultados medibles en salud.",
  },
  {
    title: "Grupos de interés",
    text: "Usamos adecuadamente los recursos para aumentar el impacto positivo en la calidad de vida.",
  },
];

const missionStatement =
  "Somos una empresa de salud domiciliaria que trabaja con amor, respeto y profunda dedicación, que responde a las necesidades de las personas, colaboradores y aliados estratégicos, asegurando un proceso ágil, seguro y de alto impacto para nuestros grupos de interés, con el fin de usar adecuadamente los recursos, lograr mayores resultados en salud y mejorar la calidad de vida de todos.";

export const metadata = {
  title: "Misión | Especialistas En Casa",
  description:
    "Misión de Especialistas En Casa: salud domiciliaria con amor, respeto, procesos seguros e impacto para todos.",
};

export default function MisionPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="mision-title">
        <RevealOnScroll className={styles.heroCopy} delay={80}>
          <p className={styles.kicker}>Nosotros</p>
          <h1 id="mision-title">Misión</h1>
          <p className={styles.statement}>{missionStatement}</p>
        </RevealOnScroll>

        <RevealOnScroll className={styles.routePanel} delay={140} variant="scale">
          <p className={styles.panelTag}>Compromiso de valor</p>
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
            Creamos impacto para cada grupo que confía en nosotros.
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
