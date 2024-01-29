"use client";
import { Plate } from "@udecode/plate-common";
import { TComboboxItemWithData } from "@udecode/plate-combobox";
import { Editor } from "../plate-ui/editor";
import { MentionCombobox } from "../plate-ui/mention-combobox";
import { Toolbar } from "../plate-ui/toolbar";
import { ToolbarButtons } from "../plate-ui/toolbar-buttons";
import useUsersQuery from "@/queries/useUsersQuery";
import { mentionEditorPlugins } from "@/lib/plate/plugins";

export default function MentionEditor() {
  const { data } = useUsersQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });

  return (
    <Plate plugins={mentionEditorPlugins}>
      <Toolbar>
        <ToolbarButtons />
      </Toolbar>
      <Editor focusRing={false} variant={"ghost"} />
      <MentionCombobox<{ email: string }>
        items={data?.items.map((value) => ({
          key: value.id,
          text: value.fullName,
          data: { email: value.email },
        }))}
        onRenderItem={({ item, search }) => {
          return (
            <div>
              <p className="font-medium">{item.text}</p>
              <p className="text-xs text-muted-foreground">
                {(item as TComboboxItemWithData<{ email: string }>).data.email}
              </p>
            </div>
          );
        }}
      />
    </Plate>
  );
}
