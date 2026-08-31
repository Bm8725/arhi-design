/** 
About: main page of arhitecture design web app. arhitectiural studio, digitalization and 3d transformation, portfolio, contact, about us, services, shop, etc.
studio design: proarh4d.ro
compiled for: Proarh.4d design 2026 | www.proarh4d.ro, cloud hosting: Vercel, domain: proarh4d.ro
author: Eng. Balcangiu Marius/marius_service@yahoo.com/+40729411747
versions-

*/ 

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Transformare3D from "@/components/Transformare3D";
import Footer from "@/components/Footer";
import Manifestdesign from "@/components/Manifestdesign";
import CookieBanner from "@/components/Cookiebanner";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ChatWidget from "@/components/ChatSupport";
import ShopShowcase from "@/components/shopmodel";


export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <Navbar />
      
      <Hero />
      <Transformare3D />
      <Manifestdesign />
      <ShopShowcase /> 
       <WhatsAppWidget />
       <CookieBanner />
      <Footer /> 
    </main>
  );
}
/**********************************************end of story ************************************************ */