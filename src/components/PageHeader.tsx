"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "./ui/breadcrumb";
import TextCopyButton from "./ui/incopybutton";

interface Props {
  items: { href: string; name: string }[];
  action?: ReactNode;
}

export default function PageHeader({ items, action }: Props) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`py-2 sticky top-[65px] z-40 bg-white ${
        hasScrolled ? "border-b" : ""
      }`}
    >
      <Breadcrumb>
        {items.map((item) => (
          <BreadcrumbItem key={item.name}>
            <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <div className="flex">
          <h3 className="h3 text-ellipsis overflow-hidden whitespace-nowrap">
            {items[items.length - 1].name}
          </h3>
          {(items[items.length - 1].href.includes("/jobs/") ||
            items[items.length - 1].href.includes("/workspace/jobs/") ||
            items[items.length - 1].href.includes("/system-management/jobs/") ||
            items[items.length - 1].href.includes("/projects/") ||
            items[items.length - 1].href.includes("/workspace/projects/") ||
            items[items.length - 1].href.includes(
              "/system-management/projects/"
            )) && (
            <TextCopyButton
              JobId={items[items.length - 1].name}
              className="ml-7"
            />
          )}
        </div>
        {action && <div className="shrink-0 ml-2">{action}</div>}
      </div>
    </div>
  );
}
