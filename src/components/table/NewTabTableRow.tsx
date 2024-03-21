import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewTabTableRowProps {
  className?: string;
  key: string | number;
  dataState?: string;
  href: string;
  children: React.ReactNode;
}

const NewTabTableRow: React.FC<NewTabTableRowProps> = ({
  className,
  key,
  dataState,
  href,
  children,
}) => {
  return (
    <Link
      className={cn(
        "border-b last:border-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted table-row cursor-pointer",
        className
      )}
      key={key}
      data-state={dataState}
      href={href}
    >
      {children}
    </Link>
  );
};

export default NewTabTableRow;
