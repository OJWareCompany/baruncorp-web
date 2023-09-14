import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  classname?: string;
}

export default function RowItemsContainer({ children, classname }: Props) {
  return (
    <div className={cn("flex space-x-4 [&>*]:w-full", classname)}>
      {children}
    </div>
  );
}
