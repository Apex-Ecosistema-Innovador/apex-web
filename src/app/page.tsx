import { Navbar } from "@/components/layout/Navbar";
import { connection } from "next/server";
import { Footer } from "@/components/layout/Footer";
import { BrandIntro } from "@/components/sections/BrandIntro";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { ParadigmShift } from "@/components/sections/ParadigmShift";
import { Pillars } from "@/components/sections/Pillars";
import { LearningJourney } from "@/components/sections/LearningJourney";
import { AISection } from "@/components/sections/AISection";
import { CompetitivePath } from "@/components/sections/CompetitivePath";
import { FutureLab } from "@/components/sections/FutureLab";
import { Research } from "@/components/sections/Research";
import { Impact } from "@/components/sections/Impact";
import { Team } from "@/components/sections/Team";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default async function Home() {
  await connection();

  return (
    <>
      <Navbar />
      <BrandIntro />
      <Hero />
      <Problem />
      <ParadigmShift />
      <Pillars />
      <LearningJourney />
      <AISection />
      <CompetitivePath />
      <FutureLab />
      <Research />
      <Impact />
      <Team />
      <FinalCTA />
      <Footer />
    </>
  );
}
