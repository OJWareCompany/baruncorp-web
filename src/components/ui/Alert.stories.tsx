import type { Meta, StoryObj } from "@storybook/react";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Example/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Defualt: Story = {
  render: () => (
    <Alert>
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>Alert Description Line 1</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant={"destructive"}>
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>Alert Description Line 1</AlertDescription>
    </Alert>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Alert>
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
        aspernatur id tempore aperiam tempora enim doloribus eligendi iste quos
        quam necessitatibus voluptatem, corrupti facere iusto reprehenderit
        accusamus. Id, ipsa nulla.
      </AlertDescription>
    </Alert>
  ),
};
