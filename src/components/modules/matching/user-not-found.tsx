"use client";

import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconSearch,
  IconUserX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UserNotFoundProps = {
  locale: string;
  onRetry?: () => void;
  errorType?: "notFound" | "loadFailed";
};

export function UserNotFound({
  locale,
  onRetry,
  errorType = "notFound",
}: UserNotFoundProps) {
  const t = useTranslations("matching.error");

  const isNotFound = errorType === "notFound";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            {/* Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="relative mb-8"
            >
              {/* Background Circle */}
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-destructive/20 blur-2xl" />

              {/* Icon Container */}
              <div
                className={`rounded-full p-8 ${
                  isNotFound
                    ? "bg-destructive/10 text-destructive"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {isNotFound ? (
                  <IconUserX className="h-20 w-20" />
                ) : (
                  <IconAlertCircle className="h-20 w-20" />
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-3xl font-bold tracking-tight"
            >
              {isNotFound ? t("userNotFound") : t("loadProfile")}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 max-w-md text-muted-foreground"
            >
              {isNotFound
                ? t("userNotFoundDescription")
                : "There was an error loading the user profile. Please try again."}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild className="gap-2">
                <Link href={`/${locale}/matching`}>
                  <IconArrowLeft className="h-5 w-5" />
                  {t("backToMatching")}
                </Link>
              </Button>

              {!isNotFound && onRetry && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2"
                >
                  <IconRefresh className="h-5 w-5" />
                  {t("retry")}
                </Button>
              )}

              {isNotFound && (
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <Link href={`/${locale}/matching`}>
                    <IconSearch className="h-5 w-5" />
                    Find Other Users
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Additional Info */}
            {isNotFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground"
              >
                <p className="flex items-center justify-center gap-2">
                  <IconAlertCircle className="h-4 w-4" />
                  This user may have deleted their account or the link is
                  incorrect
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
