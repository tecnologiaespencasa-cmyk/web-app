import Image from "next/image";
import Link from "next/link";
import ScrollCtaLink from "./components/ScrollCtaLink";
import RevealOnScroll from "./components/RevealOnScroll";
import styles from "./page.module.css";

const heroPhotos = [
  {
    src: "/inicio/equipo-movil.jpg",
    alt: "Equipo de salud domiciliaria junto al veh\u00edculo institucional",
    className: "photoPrimary",
  },
  {
    src: "/inicio/consulta-oido.jpg",
    alt: "Profesional de salud realizando valoraci\u00f3n auditiva en casa",
    className: "photoTop",
  },
  {
    src: "/inicio/control-presion3.jpg",
    alt: "Control de signos vitales en el hogar de una paciente",
    className: "photoBottom",
  },
];

const careMoments = [
  {
    src: "/inicio/cuidado-enfermeria.jpg",
    alt: "Enfermer\u00eda domiciliaria brindando atenci\u00f3n personalizada",
    title: "Atenci\u00f3n cercana",
    text: "Acompa\u00f1amiento humano para cada familia.",
  },
  {
    src: "/inicio/familia-cuidado.jpg",
    alt: "Equipo cl\u00ednico y pacientes en un momento de bienestar",
    title: "Trabajo en equipo",
    text: "Profesionales coordinados para una atenci\u00f3n integral.",
  },
  {
    src: "/inicio/valoracion-domiciliaria.jpg",
    alt: "Valoraci\u00f3n m\u00e9dica domiciliaria con enfoque preventivo",
    title: "Prevenci\u00f3n activa",
    text: "Seguimiento continuo para reducir riesgos.",
  },
];

const serviceLinks = [
  {
    label: "Hospitalizaci\u00f3n en casa",
    href: "/servicios/hospitalizacion-en-casa",
    image: "/servicios-botones/hospitalizacion-en-casa-v2.png",
    imageAlt: "Hospitalizaci\u00f3n en casa",
  },
  {
    label: "Terapia F\u00edsica y Respiratoria",
    href: "/servicios/terapia-fisica-y-respiratoria",
    image: "/servicios-botones/terapia-fisica-respiratoria-v2.png",
    imageAlt: "Terapia f\u00edsica y respiratoria domiciliaria",
  },
  {
    label: "Nutrici\u00f3n",
    href: "/servicios/nutricion",
    image: "/servicios-botones/nutricion-v2.png",
    imageAlt: "Servicio de nutrici\u00f3n",
  },
  {
    label: "Fonoaudiolog\u00eda",
    href: "/servicios/fonoaudiologia",
    image: "/servicios-botones/fonoaudiologia-v2.png",
    imageAlt: "Servicio de fonoaudiolog\u00eda",
  },
  {
    label: "Cuidado integral de las heridas",
    href: "/servicios/cuidado-integral-de-las-heridas",
    image: "/servicios-botones/cuidado-integral-heridas-v2.png",
    imageAlt: "Cuidado integral de las heridas",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="inicio-title">
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Especialistas en Casa</p>
          <h1 id="inicio-title">{"Atenci\u00f3n m\u00e9dica domiciliaria especializada."}</h1>
          <p className={styles.lead}>{"Generamos experiencias extraordinarias en salud."}</p>
          <p className={styles.supportText}>
            {
              "Integramos talento humano, tecnolog\u00eda y calidez para cuidar pacientes en su hogar con seguridad y continuidad."
            }
          </p>

          <div className={styles.heroActions}>
            <Link href="/contacto" className={styles.primaryAction}>
              {"Cont\u00e1ctanos"}
            </Link>
            <ScrollCtaLink
              targetId="servicios-principales"
              className={styles.secondaryAction}
            >
              Explorar servicios
            </ScrollCtaLink>
          </div>
        </div>

        <div
          className={styles.heroVisual}
          aria-label={"Momentos de atenci\u00f3n en casa"}
        >
          {heroPhotos.map((photo) => (
            <figure
              key={photo.src}
              className={`${styles.photoCard} ${styles[photo.className]}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 980px) 100vw, 40vw"
                className={styles.photoImage}
                priority={photo.className === "photoPrimary"}
              />
            </figure>
          ))}
          <div className={styles.heroBadge}>Cobertura y cuidado en cada visita</div>
        </div>
      </section>

      <section
        id="servicios-principales"
        className={styles.servicesBlock}
        aria-labelledby="servicios-title"
      >
        <RevealOnScroll
          className={`${styles.sectionHeading} ${styles.servicesHeading}`}
          delay={80}
        >
          <div className={styles.sectionTagRow}>
            <span aria-hidden="true" className={styles.sectionTagLine} />
            <p className={styles.sectionTag}>Servicios principales</p>
          </div>
          <h2 id="servicios-title">
            {"Cuidado integral donde m\u00e1s importa: "}
            <span className={styles.servicesTitleAccent}>En Casa</span>
          </h2>
          <p className={styles.servicesLead}>
            {
              "Soluciones domiciliarias dise\u00f1adas para acompa\u00f1ar cada etapa del tratamiento con continuidad, confianza y calidez humana."
            }
          </p>
        </RevealOnScroll>
        <div className={styles.serviceGrid}>
          {serviceLinks.map((service, index) => (
            <RevealOnScroll
              key={service.href}
              delay={140 + index * 90}
              variant="scale"
            >
              <Link href={service.href} className={styles.serviceCard}>
                <span className={styles.serviceFrame}>
                  <span className={styles.serviceThumb}>
                    <Image
                      src={service.image}
                      alt={service.imageAlt || service.label}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1180px) 42vw, 18vw"
                      className={styles.serviceThumbImage}
                    />
                  </span>
                </span>
                <span className={styles.serviceMeta}>
                  <span className={styles.serviceLabel}>{service.label}</span>
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className={styles.momentsBlock} aria-labelledby="momentos-title">
        <RevealOnScroll
          className={`${styles.sectionHeading} ${styles.momentsHeading}`}
          delay={80}
        >
          <div className={styles.sectionTagRow}>
            <span aria-hidden="true" className={styles.sectionTagLine} />
            <p className={styles.sectionTag}>Experiencia del paciente</p>
          </div>
          <h2 id="momentos-title">
            {"Cuidamos con precisi\u00f3n cl\u00ednica y cercan\u00eda humana"}
          </h2>
          <p className={styles.momentsLead}>
            {
              "Cada visita combina criterio cl\u00ednico, acompa\u00f1amiento cercano y una coordinaci\u00f3n pensada para que el paciente se sienta seguro en casa."
            }
          </p>
        </RevealOnScroll>

        <div className={styles.momentGrid}>
          {careMoments.map((item, index) => (
            <RevealOnScroll
              key={item.src}
              delay={140 + index * 110}
              variant={index % 2 === 0 ? "up" : "scale"}
            >
              <article className={styles.momentCard}>
                <figure className={styles.momentMedia}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 30vw"
                    className={styles.photoImage}
                  />
                </figure>
                <div className={styles.momentBody}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </main>
  );
}
