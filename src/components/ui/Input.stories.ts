import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Example/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

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

export const Error: Story = {
  args: {
    defaultValue: "Input",
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    value: "Input Placeholder",
    disabled: true,
  },
};
