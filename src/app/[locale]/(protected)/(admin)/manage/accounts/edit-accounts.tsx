"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TranslationValues } from "next-intl";
import { useEffect, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Spinner,
} from "@/components/ui";
import { MeritLevel } from "@/constants";
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
  meritLevel: "Reliable",
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

  const meritLevelOptions = useMemo(
    () => [
      {
        value: MeritLevel.Banned,
        label: safeTranslate("meritLevels.banned", "Banned"),
        description: safeTranslate(
          "meritLevels.bannedDesc",
          "User is completely banned from the platform"
        ),
      },
      {
        value: MeritLevel.Restricted,
        label: safeTranslate("meritLevels.restricted", "Restricted"),
        description: safeTranslate(
          "meritLevels.restrictedDesc",
          "User has limited access to features"
        ),
      },
      {
        value: MeritLevel.Monitored,
        label: safeTranslate("meritLevels.monitored", "Monitored"),
        description: safeTranslate(
          "meritLevels.monitoredDesc",
          "User activities are being monitored"
        ),
      },
      {
        value: MeritLevel.Reliable,
        label: safeTranslate("meritLevels.reliable", "Reliable"),
        description: safeTranslate(
          "meritLevels.reliableDesc",
          "Standard user with full access"
        ),
      },
      {
        value: MeritLevel.Admin,
        label: safeTranslate("meritLevels.admin", "Admin"),
        description: safeTranslate(
          "meritLevels.adminDesc",
          "Administrator with full privileges"
        ),
      },
    ],
    [safeTranslate]
  );

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      return;
    }

    if (user && userId) {
      form.reset({
        id: String(user.id), // Convert to string
        meritLevel: user.meritLevel,
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
              name="meritLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">
                    {safeTranslate("form.meritLevelLabel", "Merit level")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                  >
                    <FormControl className="p-6">
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={safeTranslate(
                            "form.meritLevelPlaceholder",
                            "Select a merit level"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meritLevelOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="h-auto py-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="mt-2 w-full">
                    {safeTranslate(
                      "form.meritLevelHint",
                      "Set the user's access level and restrictions."
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
