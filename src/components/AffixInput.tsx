"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useProvidedRefOrCreate } from "@/hook/useProvidedRefOrCreate";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixElement?: React.ReactElement;
  suffixElement?: React.ReactElement;
}

/**
 * Github Primer를 참고함
 * https://github.com/primer/react/blob/main/src/TextInput/TextInput.tsx
 */
const AffixInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, prefixElement, suffixElement, onFocus, onBlur, ...props },
    ref
  ) => {
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
          "flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background items-center overflow-hidden data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
          suffixElement && "pr-3",
          prefixElement && "pl-3",
          className
        )}
        data-disabled={props.disabled}
        data-focused={isInputFocused}
        onClick={focusInput}
      >
        {prefixElement}
        <input
          className={cn(
            "bg-background flex-1 w-full min-w-0 h-full px-3 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
          )}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          ref={inputRef}
          {...props}
        />
        {suffixElement}
      </div>
    );
  }
);
AffixInput.displayName = "AffixInput";

export { AffixInput };
