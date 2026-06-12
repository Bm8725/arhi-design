/**
 * 
 * about : web app for arhitectural design studio.
 * author: Eng. Balcangiu Marius
 * design: proarh4d.ro
 * compiled for: Proarh.4d design 2026 | www.proarh4d.ro, cloud hosting: Vercel, domain: proarh4d.ro
 * copyright: © 2026 Proarh.4d birou de arhitectura. All rights reserved.
 * 
 * This is the root layout file for the Proarh.4d architecture design studio website. It sets up the global HTML structure, metadata for SEO and social sharing, and includes a minimalist service worker registration to enable PWA installation prompts. The layout uses Google Fonts (Geist Sans and Geist Mono) and applies global styles from globals.css. The body of the document is styled with Tailwind CSS classes to ensure a consistent look across the site.
 * 
 * The metadata object includes comprehensive SEO configurations, such as title, description, favicons, Open Graph data for social media sharing, and Twitter card settings. The service worker registration is done using a data URI to avoid needing an external file, which keeps the setup simple while still enabling PWA features.
 * 
 * Overall, this layout provides a solid foundation for building out the rest of the Proarh.4d website with Next.js, ensuring good performance, SEO, and user experience from the start.
 */

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
  metadataBase: new URL("https://proarh4d.ro"), // OBLIGATORIU în Next.js pentru ca link-ul pozei de share să fie valid
  title: "Proarh.4d | Birou de Proiectare Arhitecturală & Design Interior",
  description: "Servicii premium de arhitectură, proiectare rezidențială și comercială, randări 3D și urbanism. Dambovita. Romnania. Targoviste.",
  
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
    url: "https://proarh4d.ro", // Domeniul tău final
    siteName: "Proarh.4d",
    images: [
      {
        url: "/proarh3d.jpg", // Modificat aici cu poza ta landscape din public pentru share perfect
        width: 1200,
        height: 630,
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
    images: ["/proarh3d.jpg"],
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
      <head>
        {/* REPARAT: Scriptul PWA mutat corect în head pentru a evita erorile de build */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('data:text/javascript,self.addEventListener("fetch",()=>{})');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
/**********************************************end of story *************************************** */