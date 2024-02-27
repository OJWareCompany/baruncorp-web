import { createAutoformatPlugin } from "@udecode/plate-autoformat";
import {
  createPlugins,
  PlateElement,
  RenderAfterEditable,
} from "@udecode/plate-common";
import { createIndentPlugin } from "@udecode/plate-indent";
import { createIndentListPlugin } from "@udecode/plate-indent-list";
import { createLinkPlugin, ELEMENT_LINK } from "@udecode/plate-link";
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from "@udecode/plate-list";
import {
  createMentionPlugin,
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
  MentionPlugin,
} from "@udecode/plate-mention";
import { createComboboxPlugin } from "@udecode/plate-combobox";
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from "@udecode/plate-paragraph";
import { withProps } from "@udecode/cn";
import { autoformatPlugin } from "@/lib/plate/autoformatPlugin";
import { LinkElement } from "@/components/plate-ui/link-element";
import { LinkFloatingToolbar } from "@/components/plate-ui/link-floating-toolbar";
import { ListElement } from "@/components/plate-ui/list-element";
import { MentionElement } from "@/components/plate-ui/mention-element";
import { MentionInputElement } from "@/components/plate-ui/mention-input-element";
import {
  ParagraphElement,
  ParagraphElementForInputEditor,
} from "@/components/plate-ui/paragraph-element";

export const basicEditorPlugins = createPlugins(
  [
    // Nodes
    createParagraphPlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
    }),

    // Block Style
    createIndentPlugin({
      inject: {
        props: {
          validTypes: [ELEMENT_PARAGRAPH],
        },
      },
    }),
    createIndentListPlugin({
      inject: {
        props: {
          validTypes: [ELEMENT_PARAGRAPH],
        },
      },
    }),

    // Functionality
    createAutoformatPlugin(autoformatPlugin),
    createComboboxPlugin(),
  ],
  {
    components: {
      [ELEMENT_LI]: withProps(PlateElement, { as: "li" }),
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_UL]: withProps(ListElement, { variant: "ul" }),
      [ELEMENT_OL]: withProps(ListElement, { variant: "ol" }),
      [ELEMENT_PARAGRAPH]: ParagraphElement,
    },
  }
);

export const inputEditorPlugins = createPlugins(
  [
    // Nodes
    createParagraphPlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
    }),

    // Functionality
    // createComboboxPlugin(),
  ],
  {
    components: {
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_PARAGRAPH]: ParagraphElementForInputEditor,
    },
  }
);

export function getMentionEditorPlugins(mentionElementSize?: "default" | "sm") {
  return createPlugins(
    [
      // Nodes
      createParagraphPlugin(),
      createLinkPlugin({
        renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
      }),
      createMentionPlugin<MentionPlugin<{ email: string }>>({
        options: {
          createMentionNode: (item) => ({
            children: [{ text: "" }],
            type: "mention",
            value: item.text,
            email: item.data.email,
          }),
          insertSpaceAfterMention: true,
        },
      }),

      // Block Style
      createIndentPlugin({
        inject: {
          props: {
            validTypes: [ELEMENT_PARAGRAPH],
          },
        },
      }),
      createIndentListPlugin({
        inject: {
          props: {
            validTypes: [ELEMENT_PARAGRAPH],
          },
        },
      }),

      // Functionality
      createAutoformatPlugin(autoformatPlugin),
      createComboboxPlugin(),
    ],
    {
      components: {
        [ELEMENT_LI]: withProps(PlateElement, { as: "li" }),
        [ELEMENT_LINK]: LinkElement,
        [ELEMENT_MENTION]: withProps(MentionElement, {
          size: mentionElementSize,
        }),
        [ELEMENT_MENTION_INPUT]: MentionInputElement,
        [ELEMENT_UL]: withProps(ListElement, { variant: "ul" }),
        [ELEMENT_OL]: withProps(ListElement, { variant: "ol" }),
        [ELEMENT_PARAGRAPH]: ParagraphElement,
      },
    }
  );
}
