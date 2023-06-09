import type { Meta, StoryObj } from "@storybook/react";

import { InputField } from "@/components/ui/input-field";

const meta: Meta<typeof InputField> = {
  title: "Example/InputField",
  component: InputField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Placeholder: Story = {
  args: {
    label: "Form Label",
    placeholder: "Input Placeholder",
    description: "Form Description",
  },
};

export const PlaceholderRequired: Story = {
  args: {
    label: "Form Label",
    placeholder: "Input Placeholder",
    description: "Form Description",
    required: true,
  },
};

export const Input: Story = {
  args: {
    label: "Form Label",
    defaultValue: "Input",
    description: "Form Description",
  },
};

export const InputRequired: Story = {
  args: {
    label: "Form Label",
    defaultValue: "Input",
    description: "Form Description",
    required: true,
  },
};

export const Error: Story = {
  args: {
    label: "Form Label",
    defaultValue: "Input",
    errorMessage: "Form Error",
  },
};

export const ErrorRequired: Story = {
  args: {
    label: "Form Label",
    defaultValue: "Input",
    errorMessage: "Form Error",
    required: true,
  },
};

export const Diasbled: Story = {
  args: {
    label: "Form Label",
    placeholder: "Input Placeholder",
    description: "Form Description",
    disabled: true,
  },
};

export const DiasbledRequired: Story = {
  args: {
    label: "Form Label",
    placeholder: "Input Placeholder",
    description: "Form Description",
    required: true,
    disabled: true,
  },
};

// export const Error: Story = {
//   args: {
//     defaultValue: "Input",
//   },
// };

// export const Placeholder: Story = {
//   args: {
//     placeholder: "Input Placeholder",
//   },
// };

// export const Disabled: Story = {
//   args: {
//     defaultValue: "Input Placeholder",
//     disabled: true,
//   },
// };
