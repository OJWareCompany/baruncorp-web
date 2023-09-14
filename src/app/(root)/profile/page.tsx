// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useEffect } from "react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import useProfileQuery from "@/queries/useProfileQuery";
// import usePatchProfileMutation from "@/queries/usePatchProfileMutation";
// import PositionField from "@/components/PositionField";
// import ServicesField from "@/components/ServicesField";
// import LicensesField from "@/components/LicensesField";

// const formSchema = z.object({
//   firstName: z.string().trim().min(1, { message: "First Name is required" }),
//   lastName: z.string().trim().min(1, { message: "Last Name is required" }),
//   email: z.string().email(),
//   organization: z.string(),
//   role: z.string(),
// });

// export default function ProfilePage() {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       organization: "",
//     },
//   });
//   const {
//     control,
//     reset,
//     handleSubmit,
//     formState: { isSubmitting, isDirty },
//   } = form;

//   const { data: profile, isSuccess: isProfileQuerySuccess } = useProfileQuery();
//   // const { mutateAsync } = usePatchProfileMutation(profile?.id);
//   const { mutateAsync } = usePatchProfileMutation();

//   useEffect(() => {
//     if (!isProfileQuerySuccess) {
//       return;
//     }

//     const { email, firstName, lastName, organization, role } = profile;
//     reset({
//       firstName,
//       lastName,
//       email,
//       organization,
//       role: role ?? "-",
//     });
//   }, [isProfileQuerySuccess, profile, reset]);

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     const { firstName, lastName } = values;

//     await mutateAsync({
//       firstName,
//       lastName,
//     });
//   }

//   return (
//     <div className="space-y-4 max-w-sm">
//       <h1 className="h3">Profile</h1>
//       <Form {...form}>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
//           <FormField
//             control={control}
//             name="firstName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>First Name</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={control}
//             name="lastName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>Last Name</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email Address</FormLabel>
//                 <FormControl>
//                   <Input {...field} disabled />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={control}
//             name="organization"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Organization</FormLabel>
//                 <FormControl>
//                   <Input {...field} disabled />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={control}
//             name="role"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Role</FormLabel>
//                 <FormControl>
//                   <Input {...field} disabled />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button
//             type="submit"
//             fullWidth
//             disabled={!isDirty}
//             loading={isSubmitting}
//           >
//             Save
//           </Button>
//         </form>
//       </Form>
//       {profile && (
//         <>
//           <PositionField userId={profile.id} />
//           <ServicesField userId={profile.id} />
//           <LicensesField userId={profile.id} />
//         </>
//       )}
//     </div>
//   );
// }

import React from "react";

export default function Page() {
  return <div>Page</div>;
}
