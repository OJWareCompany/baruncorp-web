import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

const LoadingButton = forwardRef<HTMLButtonElement, Props>(
  ({ isLoading = false, children, onClick, ...buttonProps }: Props, ref) => {
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
        ref={ref}
      >
        {isLoading ? (
          <>
            <Loader2
              className={cn(
                "h-4 w-4 animate-spin",
                buttonProps.size !== "icon" && "mr-2"
              )}
            />
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
