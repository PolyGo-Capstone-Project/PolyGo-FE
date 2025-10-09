"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react"; // <-- Đã thêm Loader2 cho nút loading
import { useTranslations } from "next-intl"; // <-- Đã thêm useTranslations
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"; // Giữ nguyên sonner toast
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner"; // Giữ nguyên sonner Toaster
import { Textarea } from "@/components/ui/textarea";

export default function SupportPage() {
  const t = useTranslations("supportSonner"); // <-- Sử dụng namespace supportSonner
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = t("metaTitle"); // <-- Dùng key từ JSON
    }
  }, [t]);

  // 1. Zod schema (Dùng t() cho messages)
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.nameRequired"),
    }),
    email: z.string().email({
      message: t("validation.emailInvalid"),
    }),
    category: z.string().min(1, {
      message: t("validation.categoryRequired"),
    }),
    subject: z.string().min(5, {
      message: t("validation.subjectRequired"),
    }),
    message: z.string().min(20, {
      message: t("validation.messageMin"),
    }),
  });

  // 2. Define Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    },
  });

  // 3. Categories list (Dùng t() cho labels)
  const categories = [
    { value: "technical", label: t("categories.technical") },
    { value: "billing", label: t("categories.billing") },
    { value: "account", label: t("categories.account") },
    { value: "feedback", label: t("categories.feedback") },
    { value: "other", label: t("categories.other") },
  ];

  // 4. Handle Submit
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Giảm thời gian chờ xuống 500ms để phản hồi nhanh hơn
    setTimeout(() => {
      console.log("Submitted:", values);
      setIsSubmitting(false);

      // Hiển thị toast success (Dùng key từ JSON)
      toast.success(t("toastSuccess"));

      form.reset();
    }, 500); // Đã giảm từ 1500ms xuống 500ms
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 min-h-[80vh]">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {t("title")}
            </CardTitle>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.nameLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.namePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.emailLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.emailPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.categoryLabel")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("form.categoryPlaceholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.subjectLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.subjectPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.messageLabel")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("form.messagePlaceholder")}
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("form.submitting")}
                    </>
                  ) : (
                    t("form.submitButton")
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Toaster của sonner */}
        <Toaster />
      </div>
    </div>
  );
}
