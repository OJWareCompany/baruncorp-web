"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { ToolbarButtons } from "../plate-ui/toolbar-buttons";
import { Editor } from "../plate-ui/editor";
import { Toolbar } from "../plate-ui/toolbar";
import { basicEditorPlugins } from "@/lib/plate/plugins";

interface Props extends Pick<PlateProps, "value" | "onChange" | "readOnly"> {
  disabled?: boolean;
}

export default function BasicEditor({ disabled, ...props }: Props) {
  if (disabled) {
    return (
      <Plate plugins={basicEditorPlugins} {...props} readOnly>
        <Editor
          focusRing={false}
          variant={"outline"}
          disabled
          className="h-full"
        />
      </Plate>
    );
  }

  return (
    <div className="border rounded-md h-full">
      <Plate plugins={basicEditorPlugins} {...props}>
        <Toolbar>
          <ToolbarButtons />
        </Toolbar>
        <Editor focusRing={false} variant={"ghost"} />
      </Plate>
    </div>
  );
}
