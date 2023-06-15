"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const commonInputClassName =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const commonIconClassName = "h-5 w-5 text-muted-foreground";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, defaultValue, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    if (type === "password")
      return (
        <div className="flex relative items-center">
          <input
            type={showPassword ? "text" : "password"}
            defaultValue={defaultValue}
            className={cn(`${commonInputClassName} pr-10`, className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <Eye className={`${commonIconClassName}`} />
            ) : (
              <EyeOff className={`${commonIconClassName}`} />
            )}
          </button>
        </div>
      );

    return (
      <input
        type={type}
        defaultValue={defaultValue}
        className={cn(`${commonInputClassName}`, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
