import './globals.css';

export const metadata = {
  title: 'GL Strategic - Audio to Web Generator',
  description: 'Convierte audio en sitios web estáticos con transcripción automática',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
