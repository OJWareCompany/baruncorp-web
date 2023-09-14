// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import useOrganizationsQuery from "@/queries/useOrganizationsQuery";
// import usePostInvitationsMutation from "@/queries/usePostInvitationsMutation";
// import { toast } from "@/hook/use-toast";

// const formSchema = z.object({
//   email: z
//     .string()
//     .trim()
//     .min(1, { message: "Email Address is required" })
//     .email({ message: "Format of email address is incorrect" }),
//   organizationName: z.string({ required_error: "Organization is required" }),
// });

// const defaultValues = {
//   email: "ejsvk3284@kakao.com",
// };

// if (process.env.NODE_ENV === "production") {
//   defaultValues.email = "";
// }

// export default function Page() {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues,
//   });
//   const {
//     setValue,
//     formState: { isSubmitting },
//   } = form;

//   const { data: organizations } = useOrganizationsQuery();
//   const { mutateAsync } = usePostInvitationsMutation();

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     await mutateAsync(values).then(() => {
//       setValue("email", "");
//       toast({
//         title: "Invitation success",
//         description: `Email has been sent to ${values.email}.`,
//       });
//     });
//   }

//   return (
//     <>
//       <h1 className="h3 mb-4">Invitation</h1>
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-4 max-w-sm"
//         >
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>Email Address</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="organizationName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>Organization</FormLabel>
//                 <FormControl>
//                   <Select {...field} onValueChange={field.onChange}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select an organization" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectGroup>
//                         {organizations?.map((organization) => (
//                           <SelectItem
//                             key={organization.id}
//                             value={organization.name}
//                           >
//                             {organization.name}
//                           </SelectItem>
//                         ))}
//                       </SelectGroup>
//                     </SelectContent>
//                   </Select>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button type="submit" fullWidth loading={isSubmitting}>
//             Submit
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// }

import React from "react";

export default function Page() {
  return <div>Page</div>;
}
