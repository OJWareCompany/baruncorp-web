import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function RowItemsContainer({ children, className }: Props) {
  return (
    <div className={cn("flex space-x-2 [&>*]:w-full", className)}>
      {children}
    </div>
  );
}
