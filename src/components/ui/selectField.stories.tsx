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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

const formSchema = z.object({
  fruit: z.union([
    z.literal("apple"),
    z.literal("banana"),
    z.literal("blueberry"),
    z.literal("grapes"),
    z.literal("pineapple"),
  ]),
});

const meta: Meta<typeof Form> = {
  title: "Example/SelectField",
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
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fruit"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Fruit</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              {!fieldState.error && (
                <FormDescription>This is your favorite fruit.</FormDescription>
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
