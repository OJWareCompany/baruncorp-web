import React from "react";
import { useEditorReadOnly } from "@udecode/plate-common";
import { ListStyleType } from "@udecode/plate-indent-list";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { IndentListToolbarButton } from "./indent-list-toolbar-button";
import { ToolbarGroup } from "./toolbar";
import { LinkToolbarButton } from "./link-toolbar-button";

export function ToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
              <IndentListToolbarButton nodeType={ListStyleType.Disc} />
              <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
            </ToolbarGroup>
            <ToolbarGroup>
              <LinkToolbarButton />
            </ToolbarGroup>
          </>
        )}
        <div className="grow" />
        <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup>
      </div>
    </div>
  );
}
