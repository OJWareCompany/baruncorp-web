"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const trailing = (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
      >
        {isVisible ? (
          <Eye className="h-5 w-5 text-muted-foreground" />
        ) : (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    );

    return (
      <Input
        type={isVisible ? "text" : "password"}
        trailing={trailing}
        ref={ref}
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
