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
import Script from "next/script"; // 1. IMPORTĂ COMPONENTA NATIVĂ NEXT.JS
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proarh.4d | Birou de Proiectare Arhitecturală- arh. Bogdan Sotingeanu",
  description: "Servicii premium de arhitectură, proiectare rezidențială și comercială, randări 3D și urbanism Arh. Sotingeanu Bogdan. Targoviste, Pucioasa, Fieni, Moreni, Racari, Dambovita.",
  

  manifest: "/manifest.json",
  
  // 1. Configurarea pentru Favicon și Apple
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" }, 
      { url: "/favicon.svg", type: "image/svg+xml" } 
    ],
    shortcut: "/favicon.ico",
    apple: "/arhi4d.png", 
  },

  // 2. Configurarea pentru Share pe Social Media
  openGraph: {
    title: "Proarh4d.ro | Birou de Proiectare Arhitecturală. Arh. Sotingeanu Bogdan",
    description: "Servicii premium de arhitectură, proiectare rezidențială și comercială, randări 3D/4D și urbanism. Targoviste, Pucioasa, Fieni, Moreni, Racari, Dambovita.",
    url: "https://proarh4d.ro",
    siteName: "Proarh.4d",
    images: [
      {
        url: "/arhi4d.png", 
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
    title: "Proarh4d.ro | Birou de Proiectare Arhitecturală",
    description: "Servicii premium de arhitectură, proiectare rezidențială și comercială. Dambovita. Targoviste.",
    images: ["/arhi4d.png"],
  },
};



export const viewport: import("next").Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
      
                <Script
                  id="pwa-service-worker"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.register('/sw.js');
                      }
                    `,
                  }}
                />

        {children}
      </body>
    </html>
  );
}
/**********************************************end of story *************************************** */
