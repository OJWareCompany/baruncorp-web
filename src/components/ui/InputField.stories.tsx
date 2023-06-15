import type { Meta, StoryObj } from "@storybook/react";
import { FieldValues, UseFormReturn, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Button } from "./button";
import { Input } from "./input";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const meta: Meta<typeof Form> = {
  title: "Example/InputField",
  component: Form,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

const FormWithHooks = (
  args: {
    children: ReactNode | ReactNode[];
  } & UseFormReturn<FieldValues, unknown, FieldValues | undefined>
) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              {!fieldState.error && (
                <FormDescription>
                  This is your public display name.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export const Default: Story = {
  render: (args) => <FormWithHooks {...args} />,
};
