"use client";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  Pagination,
} from "@/components";
import { useMySentGiftsQuery } from "@/hooks";
import { IconGift, IconSend } from "@tabler/icons-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

type MySentGiftsTabProps = {
  locale: string;
};

export function MySentGiftsTab({ locale }: MySentGiftsTabProps) {
  const t = useTranslations("gift.sent");
  const tCommon = useTranslations("gift.common");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch sent gifts
  const { data, isLoading } = useMySentGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-[60vh] items-center justify-center"
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 rounded-full bg-primary/10 p-6">
              <IconSend className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent p-8"
      >
        <div className="absolute right-8 top-8 opacity-10">
          <IconSend className="h-32 w-32" />
        </div>
        <div className="relative">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </motion.div>

      {/* Gift History List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {gifts.map((gift, index) => (
          <motion.div
            key={gift.presentationId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Gift Icon */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-transform duration-300 group-hover:scale-110">
                    {gift.giftIconUrl ? (
                      <Image
                        src={gift.giftIconUrl}
                        alt={gift.giftName}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <IconGift className="h-8 w-8 text-primary" />
                    )}
                  </div>

                  {/* Gift Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold leading-tight">
                          {gift.giftName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {gift.receiverName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {t("to")}:{" "}
                            <span className="font-medium text-foreground">
                              {gift.receiverName}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="shadow-sm">
                          x{gift.quantity}
                        </Badge>
                        {gift.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            {t("anonymous")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {gift.message && (
                      <div className="rounded-lg bg-muted/50 p-3 border-l-4 border-primary/30">
                        <p className="text-sm italic text-muted-foreground">
                          &quot;{gift.message}&quot;
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{format(new Date(gift.createdAt), "PPp")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pageSize}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeSelector={true}
          />
        </motion.div>
      )}
    </div>
  );
}
