import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";

interface Props extends ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

const LoadingButton = forwardRef<HTMLButtonElement, Props>(
  ({ isLoading = false, children, onClick, ...buttonProps }: Props) => {
    return (
      <Button
        {...buttonProps}
        onClick={(event) => {
          if (isLoading) {
            event.preventDefault();
            return;
          }

          onClick?.(event);
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
