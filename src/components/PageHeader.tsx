import Link from "next/link";
import { ReactElement } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

interface Props {
  items: { href: string; name: string }[];
  title: string;
  action?: ReactElement;
}

export default function PageHeader({ items, title, action }: Props) {
  return (
    <div className="py-2">
      <Breadcrumb>
        {items.map((item, index) => (
          <BreadcrumbItem
            key={item.name}
            isCurrentPage={items.length - 1 === index}
          >
            <BreadcrumbLink as={Link} href={item.href}>
              {item.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
        {action}
      </div>
    </div>
  );
}
