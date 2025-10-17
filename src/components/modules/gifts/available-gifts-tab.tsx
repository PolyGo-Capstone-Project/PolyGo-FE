"use client";

import {
  IconGift,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { PurchaseGiftDialog } from "@/components/modules/gifts";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGiftsQuery } from "@/hooks";
import { formatCurrency } from "@/lib/utils";

type AvailableGiftsTabProps = {
  locale: string;
};

export function AvailableGiftsTab({ locale }: AvailableGiftsTabProps) {
  const t = useTranslations("gift.available");
  const tCommon = useTranslations("gift.common");
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch available gifts
  const { data, isLoading } = useGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  // Filter gifts based on search
  const filteredGifts = gifts.filter((gift) =>
    gift.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyClick = (giftId: string) => {
    setSelectedGiftId(giftId);
    setPurchaseDialogOpen(true);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
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
              <IconGift className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("empty")}</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new gifts!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8"
        >
          <div className="absolute right-8 top-8 opacity-10">
            <IconSparkles className="h-32 w-32" />
          </div>
          <div className="relative">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={tCommon("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="px-4 py-2">
            {filteredGifts.length}{" "}
            {filteredGifts.length === 1 ? "gift" : "gifts"}
          </Badge>
        </motion.div>

        {/* Gift Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredGifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="relative flex h-full flex-col p-6">
                  {/* Gift Icon with Animated Background */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/30">
                        {gift.iconUrl ? (
                          <Image
                            src={gift.iconUrl}
                            alt={gift.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <IconGift className="h-12 w-12 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gift Info */}
                  <div className="mb-4 flex-1 space-y-2 text-center">
                    <h3 className="line-clamp-1 text-lg font-bold">
                      {gift.name}
                    </h3>

                    {gift.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {gift.description}
                      </p>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="mb-4 flex justify-center">
                    <Badge
                      variant="secondary"
                      className="px-4 py-1.5 text-base font-bold"
                    >
                      <IconSparkles className="mr-1.5 h-4 w-4" />
                      {formatCurrency(gift.price)}
                    </Badge>
                  </div>

                  {/* Buy Button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 transition-all duration-300 group-hover:shadow-lg"
                    onClick={() => handleBuyClick(gift.id)}
                  >
                    <IconShoppingCart className="h-5 w-5" />
                    {t("buyNow")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty Search Result */}
        {filteredGifts.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[40vh] items-center justify-center"
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <IconSearch className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No gifts found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
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
        )}
      </div>

      {/* Purchase Dialog */}
      {selectedGiftId && (
        <PurchaseGiftDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          giftId={selectedGiftId}
          locale={locale}
        />
      )}
    </>
  );
}
