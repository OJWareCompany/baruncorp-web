"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { ToolbarButtons } from "../plate-ui/toolbar-buttons";
import { Editor } from "../plate-ui/editor";
import { Toolbar } from "../plate-ui/toolbar";
import { basicEditorPlugins } from "@/lib/plate/plugins";

interface Props extends Pick<PlateProps, "value" | "onChange" | "editorRef"> {}

export default function BasicEditor(props: Props) {
  return (
    <div className="border rounded-md">
      <Plate plugins={basicEditorPlugins} {...props}>
        <Toolbar>
          <ToolbarButtons />
        </Toolbar>
        <Editor autoFocus focusRing={false} variant={"ghost"} />
      </Plate>
    </div>
  );
}
