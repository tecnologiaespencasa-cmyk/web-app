export const metadata = {
  title: "Especialistas En Casa",
  description: "Salud Domiciliaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}