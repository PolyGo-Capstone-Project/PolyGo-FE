"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TranslationValues } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Spinner,
} from "@/components/ui";
import { handleErrorApi } from "@/lib/utils";
import {
  SetRestrictionsBodySchema,
  SetRestrictionsBodyType,
  UserListItemType,
} from "@/models";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type EditAccountsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (id: string, values: SetRestrictionsBodyType) => Promise<void>;
  userId: string | null;
  user?: UserListItemType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
};

const DEFAULT_VALUES: SetRestrictionsBodyType = {
  id: "",
  merit: 80,
};

export function EditAccounts({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  userId,
  user,
  isLoading,
  isSubmitting,
  tError,
}: EditAccountsProps) {
  const form = useForm<SetRestrictionsBodyType>({
    resolver: zodResolver(SetRestrictionsBodySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const getMeritLabel = (merit: number): string => {
    if (merit >= 71 && merit <= 100) {
      return safeTranslate("meritLevels.reliable", "Rất tin cậy");
    }
    if (merit >= 41 && merit <= 70) {
      return safeTranslate("meritLevels.stable", "Ổn định");
    }
    return safeTranslate("meritLevels.banned", "Cấm");
  };

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      return;
    }

    if (user && userId) {
      form.reset({
        id: String(user.id),
        merit: user.merit,
      });
    }
  }, [form, user, userId, open]);

  const onFormSubmit = async (values: SetRestrictionsBodyType) => {
    if (!userId) {
      return;
    }

    try {
      await onSubmit(userId, values);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  };

  const isFormDisabled = isSubmitting || isLoading || !userId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.editTitle", "Edit user restrictions")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.editDescription",
              "Update the merit level and restrictions for this user account."
            )}
          </SheetDescription>
        </SheetHeader>

        {user && (
          <div className="mx-4 my-4 flex items-center gap-3 rounded-lg border p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-muted-foreground text-sm">{user.mail}</span>
              <span className="text-muted-foreground text-xs">
                {safeTranslate("userIdLabel", "ID")}: {user.id}
              </span>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={(e) => {
              form.handleSubmit(onFormSubmit)(e);
            }}
            className="flex flex-1 flex-col gap-6 px-4 pb-6"
          >
            <FormField
              control={form.control}
              name="merit"
              render={({ field }) => {
                const currentMerit = field.value ?? 80;
                const meritLabel = getMeritLabel(currentMerit);
                return (
                  <FormItem>
                    <FormLabel className="mb-2">
                      {safeTranslate("form.meritLabel", "Merit")}
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={isFormDisabled}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          className="w-full"
                        />
                        <div className="rounded-md border bg-muted/40 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {safeTranslate("form.meritStatus", "Trạng thái")}:
                            </span>
                            <span className="text-sm font-semibold">
                              {meritLabel}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {currentMerit >= 71 && currentMerit <= 100 && (
                              <span>
                                {safeTranslate(
                                  "form.meritDesc.reliable",
                                  "71-100: Người dùng rất tin cậy"
                                )}
                              </span>
                            )}
                            {currentMerit >= 41 && currentMerit <= 70 && (
                              <span>
                                {safeTranslate(
                                  "form.meritDesc.stable",
                                  "41-70: Người dùng ổn định"
                                )}
                              </span>
                            )}
                            {currentMerit >= 0 && currentMerit <= 40 && (
                              <span>
                                {safeTranslate(
                                  "form.meritDesc.banned",
                                  "0-40: Người dùng bị cấm"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="mt-2">
                      {safeTranslate(
                        "form.meritHint",
                        "Nhập điểm merit từ 0-100 để đặt quyền truy cập."
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <SheetFooter className="gap-2 px-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isFormDisabled}
              >
                {safeTranslate("form.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isFormDisabled}>
                {isSubmitting ? (
                  <Spinner className="size-4" />
                ) : (
                  safeTranslate("form.submitUpdate", "Save changes")
                )}
              </Button>
            </SheetFooter>

            {isLoading && (
              <div className="flex items-center justify-center">
                <Spinner className="size-5" />
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
