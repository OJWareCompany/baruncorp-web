import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function TierDiscountRowItemsContainer({
  children,
  className,
}: Props) {
  return (
    <div className={cn("grid grid-cols-3 gap-x-2 gap-y-2", className)}>
      {children}
    </div>
  );
}
