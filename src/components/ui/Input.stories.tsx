import type { Meta, StoryObj } from "@storybook/react";

import { Search } from "lucide-react";
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

export const Disabled: Story = {
  args: {
    value: "Input",
    disabled: true,
  },
};

export const TrailingText: Story = {
  args: {
    value: "Input",
    trailing: <span className="text-muted-foreground select-none">Kw</span>,
  },
};

export const TrailingIcon: Story = {
  args: {
    value: "Input",
    trailing: <Search className="h-5 w-5 text-muted-foreground" />,
  },
};
