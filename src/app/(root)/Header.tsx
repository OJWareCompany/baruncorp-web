"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import User from "./User";
import HandToggle from "./HandToggle";
import Notification from "./Notification";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-trigger-style";
import useProfileQuery from "@/queries/useProfileQuery";

const systemManagementItems: {
  title: string;
  href: string;
}[] = [
  {
    title: "Organizations",
    href: "/system-management/organizations",
  },
  {
    title: "Users",
    href: "/system-management/users",
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
    title: "Scopes",
    href: "/system-management/scopes",
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
    title: "Client Invoices",
    href: "/system-management/client-invoices",
  },
  {
    title: "Vendor Invoices",
    href: "/system-management/vendor-invoices",
  },
  // {
  //   title: "Payments",
  //   href: "/system-management/payments",
  // },
  {
    title: "Positions",
    href: "/system-management/positions",
  },
  {
    title: "Licenses",
    href: "/system-management/licenses",
  },
  {
    title: "PTO",
    href: "/system-management/pto",
  },
  // {
  //   title: "Utilities",
  //   href: "/system-management/utilities",
  // },
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
  const { data: session } = useSession();
  const { data: profile } = useProfileQuery();

  const isWorker =
    (session && session.isBarunCorpMember) || (profile && profile.isVendor);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container px-6 flex h-16 items-center justify-between">
        <div className="flex gap-8 items-center">
          <Link href="/">
            <h1 className="h3 pointer-events-none">Barun Corp</h1>
          </Link>
          {session && profile && (
            <nav className="animate-in fade-in">
              <NavigationMenu delayDuration={0}>
                <NavigationMenuList>
                  {session.isBarunCorpMember && (
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
                  )}
                  {isWorker && (
                    <NavigationMenuItem>
                      <Link href="/workspace" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Workspace
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  )}
                  <NavigationMenuItem>
                    <Link href="/project-intake-portal" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Project Intake Portal
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/invoices" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Invoices
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          )}
        </div>
        {session && profile && (
          <div className="flex gap-2 animate-in fade-in">
            {session.isBarunCorpMember && <HandToggle />}
            <Notification />
            <User />
          </div>
        )}
      </div>
    </header>
  );
}
