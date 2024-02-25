"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { ToolbarButtons } from "../plate-ui/toolbar-buttons";
import { Editor } from "../plate-ui/editor";
import { Toolbar } from "../plate-ui/toolbar";
import { basicEditorPlugins } from "@/lib/plate/plugins";

interface Props extends Pick<PlateProps, "value" | "onChange"> {
  disabled?: boolean;
}

/**
 * floating link toolbar 가 입력 이후에 값이 유지되는 버그가 존재함
 * https://github.com/udecode/plate/issues/2791
 */
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
    <div className="border rounded-md flex flex-col h-full">
      <Plate plugins={basicEditorPlugins} {...props}>
        <Toolbar>
          <ToolbarButtons />
        </Toolbar>
        <Editor focusRing={false} variant={"ghost"} />
      </Plate>
    </div>
  );
}
