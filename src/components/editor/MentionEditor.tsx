"use client";
import { Plate, PlateProps } from "@udecode/plate-common";
import { TComboboxItemWithData } from "@udecode/plate-combobox";
import { Editor } from "../plate-ui/editor";
import { MentionCombobox } from "../plate-ui/mention-combobox";
import { Toolbar } from "../plate-ui/toolbar";
import { ToolbarButtons } from "../plate-ui/toolbar-buttons";
import { mentionEditorPlugins } from "@/lib/plate/plugins";
import useExcludeInactiveUsersQuery from "@/queries/useExcludeInactiveUsersQuery";

interface Props extends Pick<PlateProps, "value" | "onChange" | "editorRef"> {}

export default function MentionEditor(props: Props) {
  const { data } = useExcludeInactiveUsersQuery();

  return (
    <div className="border rounded-md">
      <Plate plugins={mentionEditorPlugins} {...props}>
        <Toolbar>
          <ToolbarButtons />
        </Toolbar>
        <Editor focusRing={false} variant={"ghost"} />
        <MentionCombobox<{ email: string }>
          items={data?.map((value) => ({
            key: value.id,
            text: `${value.fullName}`,
            data: { email: value.email },
          }))}
          filter={(search) => (value) => {
            const target = `${value.text} ${value.data.email}`;

            return target.toLowerCase().includes(search.toLowerCase());
          }}
          onRenderItem={({ item, search }) => {
            return (
              <div>
                <p className="font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">
                  {
                    (item as TComboboxItemWithData<{ email: string }>).data
                      .email
                  }
                </p>
              </div>
            );
          }}
        />
      </Plate>
    </div>
  );
}
