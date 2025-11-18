"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
} from "@/components";
import {
  useCreateAccountBank,
  useDeleteAccountBank,
  useUserWallet,
} from "@/hooks";
import { fetchVietQRBanks, VietQRBankType } from "@/lib/apis/vietqr";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import {
  CreateAccountBankBodySchema,
  CreateAccountBankBodyType,
} from "@/models";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ManageBankAccountDialogProps {
  children?: React.ReactNode;
}

export function ManageBankAccountDialog({
  children,
}: ManageBankAccountDialogProps) {
  const t = useTranslations("wallet.bankAccount");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<VietQRBankType[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data: walletData, isLoading: isWalletLoading } = useUserWallet();
  const createMutation = useCreateAccountBank();
  const deleteMutation = useDeleteAccountBank();

  const accounts = walletData?.payload.data.accounts ?? [];
  const numberOfAccounts = accounts.length;
  const canAddMore = numberOfAccounts < 2;

  // Filter banks based on search query
  const filteredBanks = searchQuery
    ? banks.filter(
        (bank) =>
          bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : banks;

  const form = useForm<CreateAccountBankBodyType>({
    resolver: zodResolver(CreateAccountBankBodySchema),
    defaultValues: {
      bankName: "",
      bankNumber: "",
      accountName: "",
    },
  });

  // Fetch banks on mount
  useEffect(() => {
    async function loadBanks() {
      setIsLoadingBanks(true);
      try {
        const banksData = await fetchVietQRBanks();
        setBanks(banksData);
      } catch (error) {
        showErrorToast("fetchBanksError", tError);
      } finally {
        setIsLoadingBanks(false);
      }
    }
    loadBanks();
  }, []);

  const onSubmit = async (values: CreateAccountBankBodyType) => {
    try {
      await createMutation.mutateAsync(values);
      showSuccessToast("Create", tSuccess);
      form.reset();
    } catch (error) {
      showErrorToast("Create", tError);
    }
  };

  const handleDelete = async (bankNumber: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;

    try {
      await deleteMutation.mutateAsync(bankNumber);
      showSuccessToast("Delete", tSuccess);
    } catch (error) {
      showErrorToast("Delete", tError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Building2 className="h-4 w-4" />
            {/* {t("manage")} */}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Accounts */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              {t("currentAccounts")} ({numberOfAccounts}/2)
            </h3>

            {isWalletLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t("noAccounts")}
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.bankNumber}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountName}
                      </p>
                      <p className="text-sm font-mono">{account.bankNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account.bankNumber)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Add New Account Form */}
          {canAddMore ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                {t("addNew")}
                {banks.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({banks.length} banks available)
                  </span>
                )}
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Bank Name Combobox */}
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t("bankName")}</FormLabel>
                        <Popover
                          open={comboboxOpen}
                          onOpenChange={setComboboxOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={isLoadingBanks}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? banks.find(
                                      (bank) => bank.name === field.value
                                    )?.name
                                  : isLoadingBanks
                                    ? t("loadingBanks")
                                    : t("selectBank")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <div className="p-2">
                              <Input
                                placeholder={t("searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <ScrollArea
                              className="h-[200px]"
                              onWheel={(e) => e.stopPropagation()}
                            >
                              <div className="p-1">
                                {filteredBanks.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    {searchQuery
                                      ? t("noBanksFound")
                                      : t("noAccounts")}
                                  </div>
                                ) : (
                                  filteredBanks.map((bank) => (
                                    <Button
                                      key={bank.code}
                                      variant="ghost"
                                      className="w-full justify-start text-left font-normal"
                                      onClick={() => {
                                        field.onChange(bank.name);
                                        setComboboxOpen(false);
                                        setSearchQuery("");
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === bank.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">
                                          {bank.shortName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {bank.name}
                                        </span>
                                      </div>
                                    </Button>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Name */}
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("accountName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("accountNamePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Number */}
                  <FormField
                    control={form.control}
                    name="bankNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("bankNumber")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("bankNumberPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createMutation.isPending || isLoadingBanks}
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("adding")}
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          {t("add")}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={createMutation.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t("reset")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              {t("maxAccountsReached")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
