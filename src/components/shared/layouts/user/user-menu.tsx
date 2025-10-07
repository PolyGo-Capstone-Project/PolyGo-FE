"use client";

import { IconCalendarEvent } from "@tabler/icons-react";
import { LogOut, Settings, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";

export function UserMenu() {
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logout clicked");
    router.push("/login");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 hover:bg-accent/60"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar.png" alt="@QuangHuy" />
            <AvatarFallback>QH</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 mt-2 z-[9999]" // tăng z-index cao
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold">Quang Huy</span>
          <span className="text-xs text-muted-foreground">
            huyq09@gmail.com
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/events")}>
          <IconCalendarEvent className="mr-2 h-4 w-4" />
          <span>My Events</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/wallet")}>
          <Wallet className="mr-2 h-4 w-4" />
          <span>Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
