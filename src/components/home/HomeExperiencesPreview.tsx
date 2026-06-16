"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExperiencesShowcase } from "@/components/experiences/ExperiencesShowcase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { scrollReveal, scrollRevealReduced } from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";

export function HomeExperiencesPreview() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const exp = t.experiences;

  return (
    <section
      aria-labelledby="home-experiences-heading"
      className="home-experiences-preview relative w-full min-w-0"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-48px" }}
        variants={reduceMotion ? scrollRevealReduced : scrollReveal}
        className="mb-8 sm:mb-10"
      >
        <SectionHeader
          titleId="home-experiences-heading"
          eyebrow={exp.eyebrow}
          title={exp.title}
          subtitle={exp.subtitle}
          align="center"
          icon="experiences"
        />
      </motion.div>
      <ExperiencesShowcase />
    </section>
  );
}
