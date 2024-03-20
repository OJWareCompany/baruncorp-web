import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewTabTableRowProps {
  className?: string;
  key: string | number;
  dataState?: string;
  onClick?: () => void;
  href: string;
  children: React.ReactNode;
}

const NewTabTableRow: React.FC<NewTabTableRowProps> = ({
  className,
  key,
  dataState,
  onClick,
  href,
  children,
}) => {
  return (
    <Link
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted table-row cursor-pointer",
        className
      )}
      href={href}
      key={key}
      data-state={dataState}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NewTabTableRow;
