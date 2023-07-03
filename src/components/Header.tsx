"use client";

import { LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React, { useState } from "react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import useProfileQuery from "@/queries/useProfileQuery";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Project Intake Portal", pathname: "/project-intake-portal" },
  { name: "Project Management", pathname: "/project-management" },
  { name: "Invoice", pathname: "/invoice" },
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
];

export default function Header() {
  const { data: profile } = useProfileQuery();

  const fullName = profile && `${profile.firstName} ${profile.lastName}`; // TODO: `GET /users/profile`의 응답이 fullName을 내려주면 개선한다.

  const handleSignOutButtonClick = () => {
    signOut({ redirect: false });
  };

  const [leftOfHoveredMenu, setLeftOfHoveredMenu] = useState<number>(0);

  const handleMouseEnter = (event: any) => {
    setLeftOfHoveredMenu(event.currentTarget.getBoundingClientRect().x);
  };

  const handleMouseLeave = () => {
    setLeftOfHoveredMenu(0);
  };

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-8 items-center">
          <Link href="/">
            <h1 className="h3 pointer-events-none">Barun Corp.</h1>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem
                onMouseEnter={handleMouseEnter}
                // onMouseLeave={handleMouseLeave}
              >
                <NavigationMenuTrigger>People operations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="py-2 w-48">
                    {peopleOperationsNavItems.map((item) => (
                      <NavigationMenuItem key={item.pathname}>
                        <Link href={item.pathname} legacyBehavior passHref>
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "rounded-none w-full justify-start"
                            )}
                          >
                            {item.name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.pathname}>
                  <Link href={item.pathname} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem
                onMouseEnter={handleMouseEnter}
                // onMouseLeave={handleMouseLeave}
              >
                <NavigationMenuTrigger>Common</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="py-2 w-48">
                    {commonNavItems.map((item) => (
                      <NavigationMenuItem key={item.pathname}>
                        <Link href={item.pathname} legacyBehavior passHref>
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "rounded-none w-full justify-start"
                            )}
                          >
                            {item.name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuViewport
                style={{
                  transform: `translateX(${leftOfHoveredMenu}px)`,
                }}
              />
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {fullName && (
              <Button
                variant={"ghost"}
                className="relative h-8 w-8 rounded-full animate-in fade-in"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{fullName.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="sm">{fullName}</span>
                <span className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
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
        </DropdownMenu>
      </div>
    </header>
  );
}
