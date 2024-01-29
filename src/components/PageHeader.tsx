import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "./ui/breadcrumb";

interface Props {
  items: { href: string; name: string }[];
  action?: ReactNode;
}

export default function PageHeader({ items, action }: Props) {
  return (
    <div className="py-2">
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
