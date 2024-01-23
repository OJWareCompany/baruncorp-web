"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { Editor } from "../plate-ui/editor";
import { inputEditorPlugins } from "@/lib/plate/plugins";

interface Props extends Pick<PlateProps, "value" | "onChange" | "readOnly"> {
  disabled?: boolean;
}

export default function InputEditor(props: Props) {
  if (props.disabled) {
    return (
      <Plate
        plugins={inputEditorPlugins}
        key={JSON.stringify(props.value)}
        {...props}
      >
        <Editor className="min-h-[40px] h-[40px] pt-[9px]" disabled />
      </Plate>
    );
  }

  return (
    <Plate plugins={inputEditorPlugins} {...props}>
      <Editor className="min-h-[40px] h-[40px] pt-[9px]" />
    </Plate>
  );
}
