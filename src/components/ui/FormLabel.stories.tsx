import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefAttributes } from "react";
import { Form, FormField, FormItem, FormLabel, FormLabelProps } from "./form";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const meta: Meta<typeof FormLabel> = {
  title: "Example/FormLabel",
  component: FormLabel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormLabel>;

const FormLabelWithHooks = (
  args: FormLabelProps & RefAttributes<HTMLLabelElement>
) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={() => (
            <FormItem>
              <FormLabel {...args}>Username</FormLabel>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export const Default: Story = {
  render: (args) => <FormLabelWithHooks {...args} />,
};

export const Required: Story = {
  render: (args) => <FormLabelWithHooks {...args} />,
  args: {
    required: true,
  },
};
