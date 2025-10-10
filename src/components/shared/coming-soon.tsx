"use client";

import { IconHourglassHigh, IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface ComingSoonProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
  useTranslation?: boolean;
}

export function ComingSoon({
  title,
  description,
  showIcon = true,
  useTranslation = false,
}: ComingSoonProps) {
  const t = useTranslations("comingSoon");

  const displayTitle = useTranslation ? t("title") : title || "Coming Soon";
  const displayDescription = useTranslation
    ? t("description")
    : description || "This feature is under development. Stay tuned!";
  const workingText = useTranslation
    ? t("working")
    : "We're working hard to bring this to you";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md"
      >
        {showIcon && (
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <IconHourglassHigh className="w-20 h-20 text-primary relative z-10" />
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {displayTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            {displayDescription}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <IconSparkles className="w-4 h-4 text-yellow-500" />
          <span>{workingText}</span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto max-w-xs origin-left"
        />
      </motion.div>
    </div>
  );
}
