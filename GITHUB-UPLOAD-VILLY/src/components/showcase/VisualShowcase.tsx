"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { playFeedback } from "@/lib/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmartVideo } from "@/components/showcase/SmartVideo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useI18n } from "@/providers/LanguageProvider";
import type { GalleryData, GalleryItem } from "@/types";
import { cn } from "@/lib/utils";

const tileMotion = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function aspectClass(aspect: GalleryItem["aspect"]) {
  return aspect === "9:16" ? "aspect-[9/16]" : "aspect-video";
}

interface VisualShowcaseProps {
  gallery: GalleryData;
}

export function VisualShowcase({ gallery }: VisualShowcaseProps) {
  const { t } = useI18n();
  const s = t.showcase;
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  return (
    <section className="summer-section py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-14"
        >
          <SectionHeader
            eyebrow={s.eyebrow}
            title={s.title}
            subtitle={s.subtitle}
            align="center"
          />
        </motion.div>

        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {gallery.items.map((item, index) => (
            <motion.div
              key={item.id}
              custom={index}
              variants={tileMotion}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mb-3 break-inside-avoid sm:mb-4"
            >
              {item.type === "image" ? (
                <button
                  type="button"
                  data-sfx-skip
                  onClick={() => {
                    playFeedback("open", "light");
                    setActiveItem(item);
                  }}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl bg-zinc-900",
                    aspectClass(item.aspect),
                  )}
                  aria-label={item.alt}
                >
                  <SafeImage
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover grayscale-[30%] transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-[10px] tracking-[0.1em] text-white/80">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </button>
              ) : (
                <div className="overflow-hidden rounded-xl">
                  <SmartVideo
                    src={item.src}
                    aspect={item.aspect}
                    poster={item.poster}
                    alt={item.alt}
                    preview
                    onPreviewClick={() => {
                      playFeedback("open", "light");
                      setActiveItem(item);
                    }}
                  />
                  {item.caption && (
                    <p className="mt-2 px-1 text-[10px] text-white/70">
                      {item.caption}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!activeItem}
        onOpenChange={(open) => {
          if (!open) {
            playFeedback("dismiss", "light");
            setActiveItem(null);
          }
        }}
      >
        {activeItem && (
          <DialogContent className="border-white/10 bg-black p-3 sm:p-5">
            <DialogTitle className="sr-only">{activeItem.alt}</DialogTitle>
            <DialogDescription className="sr-only">
              {activeItem.caption ?? activeItem.alt}
            </DialogDescription>

            {activeItem.type === "image" ? (
              <div
                className={cn(
                  "relative mx-auto w-full overflow-hidden rounded-lg",
                  aspectClass(activeItem.aspect),
                  "max-h-[80vh]",
                )}
              >
                <SafeImage
                  src={activeItem.src}
                  alt={activeItem.alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <SmartVideo
                src={activeItem.src}
                aspect={activeItem.aspect}
                poster={activeItem.poster}
                alt={activeItem.alt}
              />
            )}

            {activeItem.caption && (
              <p className="mt-3 text-center text-sm text-white/55">
                {activeItem.caption}
              </p>
            )}
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
