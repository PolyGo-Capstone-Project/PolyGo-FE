"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";

// Khai báo kiểu dữ liệu cho form cá nhân mới
type SupportForm = {
  name: string;
  phone: string;
  email: string;
  topic: string; // Trường mới: Chủ đề hỗ trợ
  message: string;
};

export default function SupportPage() {
  const t = useTranslations("support");

  // Lấy danh sách FAQ để tạo dropdown Topic
  // Lưu ý: t.raw("faq") giả định trả về object có các key là q1, q2, q3, q4
  const faqKeys = Object.keys(t.raw("faq") || {}).filter((key) =>
    key.startsWith("q")
  );
  const supportTopics = faqKeys.map((key) => ({
    value: key,
    label: t(`faq.${key}`),
  }));

  const [form, setForm] = useState<SupportForm>({
    name: "",
    phone: "",
    email: "",
    topic: "", // Giá trị mặc định
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Sửa lỗi: CẦN CÓ VALIDATION. isFormValid kiểm tra tất cả các trường bắt buộc
  const isFormValid =
    !!form.name &&
    !!form.phone &&
    !!form.email &&
    !!form.topic &&
    !!form.message;

  function update<K extends keyof SupportForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulate real API call (500ms delay)
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert(t("success"));

      // Reset form sau khi gửi thành công
      setForm({ name: "", phone: "", email: "", topic: "", message: "" });

      router.refresh();
    } catch (err) {
      console.error("Submission error:", err);
      alert(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Title Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-balance">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("form.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Support Form (8/12) */}
        <section className="lg:col-span-8">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold">
                {t("form.title")}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t("note")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={t("form.namePlaceholder")}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder={t("form.phonePlaceholder")}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                {/* Email & Topic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder={t("form.emailPlaceholder")}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("topic")}</Label>
                    <Select
                      onValueChange={(val) => update("topic", val)}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder={t("selectTopicPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {supportTopics.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">{t("form.message")}</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder={t("form.messagePlaceholder")}
                    rows={6}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="h-11 px-8 font-semibold"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      {/* CSS-based loading spinner */}
                      <span className="mr-2 h-4 w-4 animate-spin border-t-2 border-primary rounded-full" />
                      {t("form.sending")}
                    </span>
                  ) : (
                    t("form.submit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Right: Contact info + actions + FAQ (4/12) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Contact Info Card */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{t("contact.title")}</CardTitle>
              <CardDescription>{t("contact.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                {/* Email - Dùng Emoji 📧 */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <span className="text-xl shrink-0">📧</span>
                  <div>
                    <strong className="text-foreground">
                      {t("contact.emailLabel")}:
                    </strong>
                    <div className="text-muted-foreground mt-0.5">
                      {t("contact.emailValue")}
                    </div>
                  </div>
                </div>

                {/* Phone - Dùng Emoji 📞 */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <span className="text-xl shrink-0">📞</span>
                  <div>
                    <strong className="text-foreground">
                      {t("form.phone")}:
                    </strong>
                    <div className="text-muted-foreground mt-0.5">
                      {t("contact.phone")}
                    </div>
                  </div>
                </div>

                {/* Address - Dùng Emoji 📍 */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <span className="text-xl shrink-0">📍</span>
                  <div>
                    <strong className="text-foreground">
                      {t("contact.addressLabel")}:
                    </strong>
                    <div className="text-muted-foreground mt-0.5">
                      {t("contact.addressValue")}
                    </div>
                  </div>
                </div>

                {/* Hours - Dùng Emoji 🕒 */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <span className="text-xl shrink-0">🕒</span>
                  <div>
                    <strong className="text-foreground">
                      {t("contact.hoursLabel")}:
                    </strong>
                    <div className="text-muted-foreground mt-0.5">
                      {t("contact.hoursValue")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">{t("faq.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {/* Hiển thị danh sách FAQ dựa trên data */}
                {supportTopics.map((item, index) => (
                  <li key={item.value} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
