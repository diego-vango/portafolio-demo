import type {Metadata} from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css'; // Global styles

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: 'Trino | Agencia de Proyectos Culturales',
  description: 'Somos una agencia de proyectos culturales que impulsa proyectos artísticos y culturales con gestión integral y humana.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${syne.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="bg-brand-midnight text-white font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
