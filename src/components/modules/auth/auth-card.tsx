"use client";

import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-xl">
      <Card className="shadow-xl border-border/50">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <div className="flex items-center justify-center rounded-lg text-primary-foreground">
              <Image
                src="/assets/logo/Primary2.png"
                alt="PolyGo logo"
                width={72}
                height={72}
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </div>
  );
}
