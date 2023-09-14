import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

interface Props extends ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  isLoading = false,
  children,
  ...buttonProps
}: Props) {
  return (
    <Button {...buttonProps}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
