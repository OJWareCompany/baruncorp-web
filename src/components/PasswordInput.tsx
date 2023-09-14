"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputProps } from "./ui/input";
import { AffixInput } from "./AffixInput";

const PasswordInput = (inputProps: InputProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const suffixElement = (
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
    <AffixInput
      type={isVisible ? "text" : "password"}
      suffixElement={suffixElement}
      {...inputProps}
    />
  );
};
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
