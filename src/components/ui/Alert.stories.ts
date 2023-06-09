import type { Meta, StoryObj } from "@storybook/react";

import { Alert } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Example/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Defualt: Story = {
  args: {
    title: "Alert Title",
    description: "Alert Description Line 1",
  },
};

export const Error: Story = {
  args: {
    title: "Alert Title",
    description: "Alert Description Line 1",
    error: true,
  },
};
