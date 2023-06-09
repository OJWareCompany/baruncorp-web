import { Input } from "./input";
import { Label } from "./label";

interface Props {
  id: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder: string;
  defaultValue?: string;
  description: string;
  errorMessage?: string;
}

export function InputField({
  id,
  label,
  required = false,
  disabled = false,
  type,
  placeholder,
  defaultValue,
  description,
  errorMessage,
}: Props) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input
        defaultValue={defaultValue}
        type={type}
        id={id}
        placeholder={placeholder}
        error={!!errorMessage}
        disabled={disabled}
      />
      {!errorMessage && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
