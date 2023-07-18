import type { Meta, StoryObj } from "@storybook/react";

import { PasswordInput } from "./password-input";

const meta: Meta<typeof PasswordInput> = {
  title: "Example/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};

export const Placeholder: Story = {
  args: {
    placeholder: "Input Placeholder",
  },
};

export const Filled: Story = {
  args: {
    defaultValue: "Input",
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: "Input",
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    value: "Input Placeholder",
    disabled: true,
  },
};
