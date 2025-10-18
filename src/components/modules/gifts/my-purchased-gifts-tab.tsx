"use client";

import {
  IconGift,
  IconPackage,
  IconSearch,
  IconSend,
  IconShoppingCart,
  IconSparkles,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMyPurchasedGiftsQuery } from "@/hooks";
import { formatCurrency } from "@/lib/utils";

type MyPurchasedGiftsTabProps = {
  locale: string;
};

export function MyPurchasedGiftsTab({ locale }: MyPurchasedGiftsTabProps) {
  const t = useTranslations("gift.purchased");
  const tCommon = useTranslations("gift.common");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch purchased gifts
  const { data, isLoading } = useMyPurchasedGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  // Filter gifts based on search
  const filteredGifts = gifts.filter((gift) =>
    gift.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total items and total value
  const totalItems = gifts.reduce((sum, gift) => sum + gift.quantity, 0);
  const totalValue = gifts.reduce(
    (sum, gift) => sum + gift.price * gift.quantity,
    0
  );

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
              <IconPackage className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("empty")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Your gift inventory is empty
            </p>
            <Button variant="outline">
              <IconShoppingCart className="mr-2 h-4 w-4" />
              Browse Available Gifts
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-8"
      >
        <div className="absolute right-8 top-8 opacity-10">
          <IconPackage className="h-32 w-32" />
        </div>
        <div className="relative">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            {t("description")}
          </p>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <IconPackage className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-500/20 bg-pink-500/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-pink-500/10 p-3">
                  <IconGift className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gift Types</p>
                  <p className="text-2xl font-bold">{gifts.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <IconSparkles className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
          {filteredGifts.length} {filteredGifts.length === 1 ? "item" : "items"}
        </Badge>
      </motion.div>

      {/* Gift Inventory Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredGifts.map((gift, index) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card className="relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
              {/* Stock Badge */}
              <div className="absolute right-3 top-3 z-10">
                <Badge
                  variant={gift.quantity > 5 ? "default" : "destructive"}
                  className="shadow-lg"
                >
                  x{gift.quantity}
                </Badge>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardContent className="relative flex h-full flex-col p-6">
                {/* Gift Icon with Stock Ring */}
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    {/* Stock indicator ring */}
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${(gift.quantity / 10) * 283} 283`}
                        className={
                          gift.quantity > 5
                            ? "text-green-500"
                            : gift.quantity > 2
                              ? "text-amber-500"
                              : "text-red-500"
                        }
                      />
                    </svg>

                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 group-hover:scale-110">
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

                {/* Price and Quantity Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span className="font-semibold">
                      {formatCurrency(gift.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(gift.price * gift.quantity)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <IconSend className="h-5 w-5" />
                  Send as Gift
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
  );
}
