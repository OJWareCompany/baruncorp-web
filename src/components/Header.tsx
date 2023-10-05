"use client";

import { Building, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const systemManagementItems: {
  title: string;
  href: string;
}[] = [
  {
    title: "Users",
    href: "/system-management/users",
  },
  {
    title: "Organizations",
    href: "/system-management/organizations",
  },
  {
    title: "Projects",
    href: "/system-management/projects",
  },
  {
    title: "Jobs",
    href: "/system-management/jobs",
  },
  {
    title: "Tasks",
    href: "/system-management/tasks",
  },
  {
    title: "AHJ Notes",
    href: "/system-management/ahj-notes",
  },
  {
    title: "Invoices",
    href: "/system-management/invoices",
  },
  {
    title: "Payments",
    href: "/system-management/payments",
  },
  // {
  //   title: "Tracking Numbers",
  //   href: "/system-management/tracking-numbers",
  // },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Header() {
  const { toast } = useToast();
  const { data: user } = useProfileQuery();

  const handleSignOutButtonClick = () => {
    signOut({ redirect: false });
    toast({ title: "Sign-out success" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container px-6 flex h-16 items-center justify-between">
        <div className="flex gap-8 items-center">
          <Link href="/">
            <h1 className="h3 pointer-events-none">Barun Corp</h1>
          </Link>
          <nav>
            <NavigationMenu delayDuration={0}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    System Management
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="p-1 w-56">
                      {systemManagementItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <Link href="/workspace" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Workspace
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem> */}
                <NavigationMenuItem>
                  <Link href="/project-intake-portal" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Project Intake Portal
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <Link href="/project-management" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Project Management
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/invoice" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Invoice
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem> */}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {user?.fullName && (
              <Button
                variant={"ghost"}
                className="relative h-10 w-10 rounded-full animate-in fade-in"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </Button>
            )}
          </DropdownMenuTrigger>
          {user && (
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <span className="sm">{user.fullName}</span>
                  <span className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my/profile">
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my/organization">
                  <Building className="mr-2 h-4 w-4" />
                  <span>Organization</span>
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
