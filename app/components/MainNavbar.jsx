"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./MainNavbar.module.css";

const menuGroups = [
  {
    id: "nosotros",
    label: "Nosotros",
    items: [
      { label: "Misi\u00f3n", href: "/nosotros/mision" },
      { label: "Visi\u00f3n", href: "/nosotros/vision" },
    ],
  },
  {
    id: "servicios",
    label: "Servicios",
    items: [
      {
        label: "Hospitalizaci\u00f3n en casa",
        href: "/servicios/hospitalizacion-en-casa",
      },
      {
        label: "Terapia F\u00edsica y Respiratoria",
        href: "/servicios/terapia-fisica-y-respiratoria",
      },
      { label: "Nutrici\u00f3n", href: "/servicios/nutricion" },
      { label: "Fonoaudiolog\u00eda", href: "/servicios/fonoaudiologia" },
      {
        label: "Cuidado integral de las heridas",
        href: "/servicios/cuidado-integral-de-las-heridas",
      },
    ],
  },
];

function DropdownMenu({ menu, isOpen, onToggle, onClose }) {
  return (
    <div className={styles.dropdown}>
      <button
        type="button"
        className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${menu.id}-menu`}
        onClick={onToggle}
      >
        {menu.label}
      </button>
      {isOpen ? (
        <ul id={`${menu.id}-menu`} className={styles.dropdownMenu} role="menu">
          {menu.items.map((item) => (
            <li key={item.href} role="none">
              <Link href={item.href} role="menuitem" className={styles.dropdownLink} onClick={onClose}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function MainNavbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef(null);

  const closeAllMenus = () => {
    setOpenMenu(null);
    setIsMobileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!navRef.current?.contains(event.target)) {
        closeAllMenus();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeAllMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className={styles.header}>
      <nav ref={navRef} className={styles.nav} aria-label="Men\u00fa principal">
        <Link href="/" className={styles.brand} aria-label="Inicio">
          <Image
            className={styles.logo}
            src="/logo2.png"
            alt="Especialistas en Casa Medicina Domiciliaria"
            width={320}
            height={143}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.mobileToggle}
          aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileOpen}
          aria-controls="main-nav-menu"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <span className={`${styles.toggleLine} ${isMobileOpen ? styles.toggleLineHidden : ""}`} />
          <span className={`${styles.toggleLine} ${isMobileOpen ? styles.toggleLineHidden : ""}`} />
          <span className={`${styles.toggleLine} ${isMobileOpen ? styles.toggleLineHidden : ""}`} />
          <span className={`${styles.toggleCloseLine} ${isMobileOpen ? styles.toggleCloseLineShow : ""}`} />
          <span className={`${styles.toggleCloseLine} ${isMobileOpen ? styles.toggleCloseLineShow : ""}`} />
        </button>

        <ul id="main-nav-menu" className={`${styles.menuList} ${isMobileOpen ? styles.menuListOpen : ""}`}>
          {menuGroups.map((menu) => (
            <li key={menu.id} className={styles.menuItem}>
              <DropdownMenu
                menu={menu}
                isOpen={openMenu === menu.id}
                onToggle={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                onClose={closeAllMenus}
              />
            </li>
          ))}
          <li className={styles.menuItem}>
            <Link
              href="/contacto"
              className={`${styles.menuLink} ${styles.contactLink}`}
              onClick={closeAllMenus}
            >
              Contacto
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link
              href="https://portal-administrativo-especialistasencasa.vercel.app/"
              className={styles.menuLink}
              target="_blank"
              rel="noreferrer"
              onClick={closeAllMenus}
            >
              Portal administrativo
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
