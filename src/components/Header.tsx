"use client";

import { LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useProfileQuery from "@/queries/useProfileQuery";

const projectManagementNavItems: { name: string; pathname: string }[] = [
  {
    name: "AHJs",
    pathname: "/project-management/ahjs",
  },
];

const peopleOperationsNavItems: { name: string; pathname: string }[] = [
  {
    name: "Users",
    pathname: "/people-operations/users",
  },
  {
    name: "Invitation",
    pathname: "/people-operations/invitation",
  },
];

const commonNavItems: { name: string; pathname: string }[] = [
  {
    name: "Organizations",
    pathname: "/common/organizations",
  },
  {
    name: "Organization Creation",
    pathname: "/common/organization-creation",
  },
  {
    name: "Services",
    pathname: "/common/services",
  },
];

export default function Header() {
  const { data: profile } = useProfileQuery();

  const handleSignOutButtonClick = () => {
    signOut({ redirect: false });
  };

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-8 items-center">
          <Link href="/">
            <h1 className="h3 pointer-events-none">Barun Corp.</h1>
          </Link>
          <nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"}>Project Management</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {projectManagementNavItems.map((item) => (
                  <DropdownMenuItem asChild key={item.pathname}>
                    <Link href={item.pathname}>
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"}>People Opertaions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {peopleOperationsNavItems.map((item) => (
                  <DropdownMenuItem asChild key={item.pathname}>
                    <Link href={item.pathname}>
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"}>Common</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {commonNavItems.map((item) => (
                  <DropdownMenuItem asChild key={item.pathname}>
                    <Link href={item.pathname}>
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {profile?.fullName && (
              <Button
                variant={"ghost"}
                className="relative h-10 w-10 rounded-full animate-in fade-in"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {profile.fullName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </DropdownMenuTrigger>
          {profile && (
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <span className="sm">{profile.fullName}</span>
                  <span className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOutButtonClick}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
}
