import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configurare completă SEO, Favicon și Share (Open Graph)
export const metadata: Metadata = {
  title: "Proarh.4d | Birou de Proiectare Arhitecturală & Design Interior",
  description: "Servicii premium de arhitectură, proiectare rezidențială și comercială, randări 3D și urbanism. Generat de BM.",
  
  // 1. Configurarea pentru Favicon
  icons: {
    icon: "/proarh4d.ro.png",
    shortcut: "/proarh4d.ro.png",
    apple: "/proarh4d.ro.png", // Pentru utilizatorii care salvează site-ul pe ecranul la iPhone
  },

  // 2. Configurarea pentru Share pe Social Media (Facebook, WhatsApp, LinkedIn etc.)
  openGraph: {
    title: "Proarh.4d | Birou de Proiectare Arhitecturală. Arh. Sotangeanu Bogdan",
    description: "Servicii premium de arhitectură, proiectare rezidențială și comercială, randări 3D/4D și urbanism.",
    url: "https://proarh4d.ro", // Pune aici domeniul tău final când va fi live
    siteName: "Proarh.4d",
    images: [
      {
        url: "/proarh4d.ro.png", // Imaginea care va apărea la share
        width: 800,
        height: 800,
        alt: "Proarh.4d Architecture Studio",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },

  // 3. Configurarea pentru Twitter / X Share
  twitter: {
    card: "summary_large_image",
    title: "Proarh.4d | Birou de Proiectare Arhitecturală",
    description: "Servicii premium de arhitectură, proiectare rezidențială și comercială. Dambovita. Targoviste.",
    images: ["/proarh4d.ro.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro" // Schimbat din "en" în "ro" deoarece site-ul tău este în limba română
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('data:text/javascript,self.addEventListener("fetch",()=>{})');
      }
    `,
  }}
/>

      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}
