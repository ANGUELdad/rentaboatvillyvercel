"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 text-center"
    >
      <p className="section-eyebrow mb-3">
        {eyebrow}
      </p>
      <h1 className="section-title text-3xl sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="section-subtitle mx-auto mt-4 max-w-xl">{subtitle}</p>
      )}
    </motion.div>
  );
}
