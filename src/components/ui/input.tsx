"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useProvidedRefOrCreate } from "@/hook/useProvidedRefOrCreate";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  trailing?: React.ReactElement;
}

/**
 * Github Primer를 참고함
 * https://github.com/primer/react/blob/main/src/TextInput/TextInput.tsx
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, trailing, onFocus, onBlur, ...props }, ref) => {
    const [isInputFocused, setIsInputFocused] = React.useState(false);
    const inputRef = useProvidedRefOrCreate(
      ref as React.RefObject<HTMLInputElement>
    );

    const focusInput: React.MouseEventHandler = () => {
      inputRef.current?.focus();
    };
    const handleInputFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsInputFocused(true);
        onFocus && onFocus(e);
      },
      [onFocus]
    );
    const handleInputBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsInputFocused(false);
        onBlur && onBlur(e);
      },
      [onBlur]
    );

    return (
      <div
        className={cn(
          "flex items-center h-10 w-full rounded-md border border-input bg-transparent text-sm ring-offset-background data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
          trailing && "pr-3",
          className
        )}
        data-disabled={props.disabled}
        data-focused={isInputFocused}
        onClick={focusInput}
      >
        <input
          className={cn(
            "bg-transparent flex-1 h-full px-3 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
          )}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          ref={inputRef}
          {...props}
        />
        {trailing}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
