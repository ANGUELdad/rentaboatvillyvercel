"use client";

import { motion } from "framer-motion";
import { ContentRow } from "@/components/ui/ContentRow";
import { experiencesToContentRowItems } from "@/lib/content-row/mappers";
import { useI18n } from "@/providers/LanguageProvider";

export function Experiences({
  hideHeader,
  variant = "section",
}: {
  hideHeader?: boolean;
  variant?: "section" | "page";
}) {
  const { t } = useI18n();
  const items = t.experiences.items ?? [];
  const rowData = experiencesToContentRowItems(items);

  return (
    <section id="experiences" className={hideHeader ? "" : "summer-section relative py-24"}>
      <div className={hideHeader ? "" : "mx-auto max-w-6xl px-6"}>
        {!hideHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="label-fit mb-3 text-summer-coral/80 uppercase">
              {t.experiences.eyebrow}
            </p>
            <h2 className="heading-fit text-3xl font-light text-white uppercase sm:text-4xl">
              {t.experiences.title}
            </h2>
            {t.experiences.subtitle && (
              <p className="body-fit mt-4 max-w-xl text-sm text-white/50">
                {t.experiences.subtitle}
              </p>
            )}
          </motion.div>
        )}

        <ContentRow
          hideHeader
          href="/booking"
          linkLabel={t.hero.cta}
          data={rowData}
          size={variant === "page" ? "large" : "default"}
          className={hideHeader ? "py-0" : "-mx-6 py-0 sm:mx-0"}
        />
      </div>
    </section>
  );
}
