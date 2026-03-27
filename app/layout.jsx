import "./globals.css";
import MainNavbar from "./components/MainNavbar";
import SiteFooter from "./components/SiteFooter";
import WhatsAppFloat from "./components/WhatsAppFloat";

export const metadata = {
  title: "Especialistas En Casa",
  description: "IPS de salud domiciliaria",
  icons: {
    icon: "/isotipo-transparente.png",
    shortcut: "/isotipo-transparente.png",
    apple: "/isotipo-transparente.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <MainNavbar />
        <div className="site-shell">{children}</div>
        <WhatsAppFloat />
        <SiteFooter />
      </body>
    </html>
  );
}

