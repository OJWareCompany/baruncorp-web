"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "./ui/breadcrumb";

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
      <div className="flex justify-between items-center h-9 gap-2">
        <h3 className="h3 text-ellipsis overflow-hidden whitespace-nowrap">
          {items[items.length - 1].name}
        </h3>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
