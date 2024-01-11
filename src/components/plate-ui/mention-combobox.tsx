import React from "react";
import { ComboboxProps, NoData } from "@udecode/plate-combobox";
import { getPluginOptions, useEditorRef } from "@udecode/plate-common";
import {
  ELEMENT_MENTION,
  getMentionOnSelectItem,
  MentionPlugin,
} from "@udecode/plate-mention";
import { Combobox } from "./combobox";

export function MentionCombobox<TData = NoData>({
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
  ...props
}: Partial<ComboboxProps<TData>> & {
  pluginKey?: string;
}) {
  const editor = useEditorRef();

  const { trigger } = getPluginOptions<MentionPlugin>(editor, pluginKey);

  return (
    <Combobox<TData>
      id={id}
      trigger={trigger!}
      controlled
      onSelectItem={getMentionOnSelectItem({
        key: pluginKey,
      })}
      {...props}
    />
  );
}
