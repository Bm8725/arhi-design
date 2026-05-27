/*
arhi design 2026 
author: B Marius 

*/ 

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Transformare3D from "@/components/Transformare3D";
import Footer from "@/components/Footer";
import Manifestdesign from "@/components/Manifestdesign";
import ChatBot from "@/components/ChatBot";


export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <Navbar />
      <Hero />
      <Transformare3D />
      <Manifestdesign />
      <ChatBot />
      <Footer /> 
    </main>
  );
}
