import { ChevronRight } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { cloneElement } from "react";
import { getValidChildren } from "@/lib/utils";

interface BreadcrumbProps {
  children: React.ReactNode;
}

export const Breadcrumb = ({ children }: BreadcrumbProps) => {
  const validChildren = getValidChildren(children);
  const clones = validChildren.map((child, index) => {
    return cloneElement(child, {
      isLastChild: validChildren.length === index + 1,
    });
  });

  return (
    <nav>
      <ol className="flex items-center">{clones}</ol>
    </nav>
  );
};
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps {
  children: React.ReactNode;
  isLastChild?: boolean;
}

export const BreadcrumbItem = ({
  children,
  isLastChild,
}: BreadcrumbItemProps) => {
  const validChildren = getValidChildren(children);
  const clones = validChildren.map((child) => {
    if (child.type === BreadcrumbLink) {
      return cloneElement(child, { isLastChild });
    }

    return null;
  });

  return (
    <li className="inline-flex items-center">
      {clones}
      {!isLastChild && (
        <span className="mx-2 opacity-50">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </li>
  );
};
BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps extends LinkProps {
  isLastChild?: boolean;
  children: React.ReactNode;
}

export const BreadcrumbLink = ({
  isLastChild,
  ...props
}: BreadcrumbLinkProps) => {
  const Comp = isLastChild ? "span" : Link;

  return (
    <Comp
      className="text-sm font-medium underline-offset-4 aria-[current]:opacity-60 [&:not([aria-current])]:hover:underline"
      aria-current={isLastChild ? "page" : undefined}
      {...props}
    />
  );
};
