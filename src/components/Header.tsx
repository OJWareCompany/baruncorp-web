"use client";

import { LogOut, UserCog2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const router = useRouter();

  const handleSignOutButtonClick = () => {
    // TODO: 인증 관련 로직 필요

    router.push("/sign-in");
  };

  return (
    <header className="px-6 h-16 flex items-center justify-between">
      <h1 className="h2">Barun Corp</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <div className="flex gap-2 items-center cursor-pointer">
            <Avatar>
              <AvatarFallback>El</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="p">Elon Musk</span>
              <span className="muted">elonmusk@tesla.com</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <Link href="/my-preferences">
            <DropdownMenuItem>
              <UserCog2 className="mr-2 h-4 w-4" />
              <span>My Preferences</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleSignOutButtonClick}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
