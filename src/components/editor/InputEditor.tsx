"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { Editor } from "../plate-ui/editor";
import { inputEditorPlugins } from "@/lib/plate/plugins";

interface Props extends Pick<PlateProps, "value" | "onChange" | "readOnly"> {
  disabled?: boolean;
}

export default function InputEditor({ disabled, ...props }: Props) {
  return (
    <Plate plugins={inputEditorPlugins} {...props} readOnly={disabled}>
      <Editor className="min-h-[40px] h-[40px] pt-[9px]" disabled={disabled} />
    </Plate>
  );
}
