import Image from "next/image";
import styles from "./SiteFooter.module.css";

const documentLinks = [
  {
    label: "Pol\u00edtica de tratamiento de datos personales",
    href: "/documentos/politica-tratamiento-datos-personales.pdf",
    icon: "document",
  },
  {
    label: "Autorizaci\u00f3n tratamiento de datos personales",
    href: "/documentos/autorizacion-tratamiento-datos-personales.pdf",
    icon: "shield",
  },
];

const contactItems = [
  {
    title: "Tel\u00e9fono",
    value: "604 3222498",
    href: "tel:6043222498",
    icon: "phone",
  },
  {
    title: "Direcci\u00f3n",
    value: "CALLE 32EE #80 39",
    detail: "Medell\u00edn (Antioquia)",
    href: "https://maps.google.com/?q=CALLE+32EE+%2380+39",
    icon: "location",
  },
];

function FooterIcon({ type }) {
  if (type === "document") {
    return (
      <svg viewBox="0 0 24 24" className={styles.itemIcon} aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 3.25A2.75 2.75 0 0 0 4.25 6v12A2.75 2.75 0 0 0 7 20.75h10A2.75 2.75 0 0 0 19.75 18V8.56a2.7 2.7 0 0 0-.8-1.94l-2.77-2.8a2.74 2.74 0 0 0-1.95-.82H7Zm0 1.5h7v3.5c0 .97.78 1.75 1.75 1.75h2.5V18c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25V6c0-.69.56-1.25 1.25-1.25Zm8.5.44 2.31 2.31h-2.06a.25.25 0 0 1-.25-.25V5.19ZM8 11.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 8 11.25Zm0 3a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z"
        />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" className={styles.itemIcon} aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2.25 5.5 4.8v5.64c0 4.14 2.5 7.95 6.33 9.65l.17.08.17-.08c3.83-1.7 6.33-5.51 6.33-9.65V4.8L12 2.25Zm0 1.61 5 1.96v4.62c0 3.42-2 6.58-5 8.08-3-1.5-5-4.66-5-8.08V5.82l5-1.96Zm-.75 3.64a.75.75 0 0 1 1.5 0v3.13l2.07 1.24a.75.75 0 0 1-.78 1.28l-2.43-1.46a.75.75 0 0 1-.36-.64V7.5Z"
        />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" className={styles.itemIcon} aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.62 4.25c.3 0 .57.2.65.48l.72 2.63c.07.24 0 .5-.18.67l-1.12 1.14c.84 1.54 2.11 2.81 3.65 3.65l1.14-1.12c.17-.18.43-.25.67-.18l2.63.72c.28.08.48.35.48.65v2.02c0 .37-.28.68-.65.71l-.89.07A10.75 10.75 0 0 1 4.91 8.53L4.98 7.64c.03-.37.34-.65.71-.65h1.93Zm0 1.5H6.38l-.03.43a9.25 9.25 0 0 0 8.47 8.47l.43-.03v-.84l-2-.55-1.32 1.3a.75.75 0 0 1-.86.13 10.15 10.15 0 0 1-4.73-4.73.75.75 0 0 1 .13-.86l1.3-1.32-.55-2Z"
        />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg viewBox="0 0 24 24" className={styles.itemIcon} aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2.5a6.25 6.25 0 0 0-6.25 6.25c0 4.57 5.36 10.9 5.58 11.16a.87.87 0 0 0 1.34 0c.22-.26 5.58-6.59 5.58-11.16A6.25 6.25 0 0 0 12 2.5Zm0 15.72c-1.62-2-4.75-6.26-4.75-9.47a4.75 4.75 0 1 1 9.5 0c0 3.21-3.13 7.47-4.75 9.47Zm0-12.22a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Zm0 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={styles.itemIcon} aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.66 3.7a.75.75 0 0 1 .74-.7h1.2a.75.75 0 0 1 .74.7l.22 3.05 2.83-1.15a.75.75 0 0 1 .96.37l.56 1.06a.75.75 0 0 1-.3.99l-2.65 1.52 2.65 1.52a.75.75 0 0 1 .3.99l-.56 1.06a.75.75 0 0 1-.96.37l-2.83-1.15-.22 3.05a.75.75 0 0 1-.74.7h-1.2a.75.75 0 0 1-.74-.7l-.22-3.05-2.83 1.15a.75.75 0 0 1-.96-.37l-.56-1.06a.75.75 0 0 1 .3-.99l2.65-1.52-2.65-1.52a.75.75 0 0 1-.3-.99l.56-1.06a.75.75 0 0 1 .96-.37l2.83 1.15.22-3.05Z"
      />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer} aria-label={"Informaci\u00f3n legal"}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Image
            src="/fondoBlanco1.png"
            alt="Especialistas En Casa"
            width={98}
            height={98}
            className={styles.brandLogo}
          />
          <p className={styles.brandTag}>{"#SiempreCuidandoDeTi"}</p>
        </div>

        <div className={styles.docsBlock}>
          <p className={styles.blockTitle}>Documentos</p>
          <ul className={styles.itemList}>
            {documentLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.itemLink}
                >
                  <FooterIcon type={item.icon} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.superSaludBlock}>
          <Image
            src="/supersalud-oficial1.png"
            alt="Vigilado Supersalud"
            width={270}
            height={86}
            className={styles.superLogo}
          />
        </div>

        <div className={styles.infoBlock}>
          <ul className={styles.itemList}>
            {contactItems.map((item) => (
              <li key={item.title}>
                <a
                  href={item.href}
                  target={item.icon === "location" ? "_blank" : undefined}
                  rel={item.icon === "location" ? "noreferrer" : undefined}
                  className={styles.itemLink}
                >
                  <FooterIcon type={item.icon} />
                  <span className={styles.itemText}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemValue}>{item.value}</span>
                    {item.detail ? (
                      <span className={styles.itemDetail}>{item.detail}</span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.rights}>
            {"\u00a9"} 2026 Especialistas En Casa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
