import type { Meta, StoryObj } from "@storybook/react";
import { columns } from "./columns";
import { payments } from "./data";
import { DataTable } from ".";

const meta: Meta<typeof DataTable> = {
  title: "Example/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  render: () => <DataTable columns={columns} data={payments} />,
};
