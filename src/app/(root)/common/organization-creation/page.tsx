"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAddressSearchQuery from "@/queries/useAddressSearchQuery";
import useDebounce from "@/hook/useDebounce";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import usePostOrganizationMutation from "@/queries/usePostOrganizationMutation";
import Scene from "@/components/Scene";
import { toast } from "@/hook/use-toast";
import { Textarea } from "@/components/ui/textarea";

const defaultValues = {
  name: "tesla",
  description: "tesla go to the moon~!",
  phoneNumber: "01028541434",
  email: "ejsvk3284@kakao.com",
  address: "",
  street1: "",
  street2: "",
  city: "",
  stateOrRegion: "",
  postalCode: "",
  country: "",
};

if (process.env.NODE_ENV === "production") {
  defaultValues.name = "";
  defaultValues.description = "";
  defaultValues.phoneNumber = "";
  defaultValues.email = "";
  defaultValues.address = "";
  defaultValues.street1 = "";
  defaultValues.street2 = "";
  defaultValues.city = "";
  defaultValues.stateOrRegion = "";
  defaultValues.postalCode = "";
  defaultValues.country = "";
}

const organizationTypes = ["client", "individual", "outsourcing"];

const formSchema = z.object({
  organizationType: z.string({
    required_error: "Organization Type is required",
  }),
  name: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  phoneNumber: z
    .string()
    .trim()
    .min(1, { message: "Phone Number is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of email address is incorrect" }),
  address: z.string(),
  street1: z.string(),
  street2: z.string(),
  city: z.string(),
  stateOrRegion: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export default function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    resetField,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const watchType = watch("organizationType");

  const watchAddress = watch("address");
  const debouncedAddress = useDebounce(watchAddress);
  const { data: addresses } = useAddressSearchQuery(debouncedAddress);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [readOnlyOf, setReadOnlyOf] = useState({
    street1: true,
    street2: true,
    city: true,
    stateOrRegion: true,
    postalCode: true,
    country: true,
  });

  const [isOpenPopover, setIsOpenPopover] = useState(false);

  function onSelectAddress(address: any) {
    setIsOpenPopover(false);
    setSelectedAddress(address);

    const resource = new Map<string, string>();

    address.context.forEach((element: any) => {
      const key = element.id.split(".")[0];
      const value = element.text;
      resource.set(key, value);
    });

    const valueOfAddressFields = {
      street1: address.text ?? "",
      street2: "",
      city: resource.get("place") ?? "",
      stateOrRegion: resource.get("region") ?? "",
      postalCode: resource.get("postcode") ?? "",
      country: resource.get("country") ?? "",
    };

    Object.entries(valueOfAddressFields).forEach(
      ([key, value]: [string, string]) => {
        resetField(
          key as
            | "street1"
            | "street2"
            | "city"
            | "stateOrRegion"
            | "postalCode"
            | "country",
          { defaultValue: value }
        );
      }
    );

    setReadOnlyOf({
      street1: valueOfAddressFields.street1 !== "",
      street2: false,
      city: valueOfAddressFields.city !== "",
      stateOrRegion: valueOfAddressFields.stateOrRegion !== "",
      postalCode: valueOfAddressFields.postalCode !== "",
      country: valueOfAddressFields.country !== "",
    });
  }

  const { mutateAsync } = usePostOrganizationMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { street1, postalCode, country } = values;
    if (street1 === "") {
      toast({
        title: "Street1 is required",
        variant: "destructive",
      });
      return;
    }
    if (postalCode.length !== 5) {
      toast({
        title: "Unvalid Postal Code",
        variant: "destructive",
      });
      return;
    }
    if (country === "") {
      toast({
        title: "Country is required",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync({ ...values })
      .then(() => {
        router.push("/common/organizations");
        toast({ title: "Organization-Creation success" });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        const { response } = error;

        let title = "Something went wrong";
        let description =
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

        switch (response?.data.statusCode) {
          case 404:
            title = "Invalid code";
            description =
              "Please check your email again. If the problem persists, please contact the Barun Corp Manager.";
            break;
          case 409:
            title = response?.data.message[0];
            description = "";
            break;
          case 500:
            title = "Server error";
            break;
        }

        toast({ title, description, variant: "destructive" });
      });
  }

  return (
    <Form {...form}>
      <h1 className="h3 mb-4">New Organization</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
        <FormField
          control={control}
          name="organizationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization Type</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {organizationTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Popover open={isOpenPopover}>
            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <PopoverTrigger asChild>
                  <FormItem>
                    <FormLabel required>Address</FormLabel>
                    <Input
                      {...field}
                      placeholder="Search for address"
                      onClick={(event) => {
                        setIsOpenPopover(true);
                        const currentTarget = event.currentTarget;
                        setTimeout(() => {
                          currentTarget.focus();
                        }, 100);
                      }}
                    />
                  </FormItem>
                </PopoverTrigger>
              )}
            />
            <PopoverContent
              className="w-96"
              side="bottom"
              onPointerDownOutside={() => setIsOpenPopover(false)}
            >
              <div className="grid space-y-2">
                {addresses?.length > 0 ? (
                  addresses.map((address: any) => (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto"
                      key={address.id}
                      onClick={() => onSelectAddress(address)}
                    >
                      {address.place_name}
                    </Button>
                  ))
                ) : (
                  <p>검색 결과 없음</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {selectedAddress && (
            <Scene
              coordinates={(selectedAddress as any).geometry.coordinates}
            />
          )}

          <FormField
            control={control}
            name="street1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["street1"]}
                    placeholder="Street1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="street2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["street2"]}
                    placeholder="Street2"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["city"]}
                    placeholder="City"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="stateOrRegion"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["stateOrRegion"]}
                    placeholder="State / Region"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["postalCode"]}
                    placeholder="Postal Code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["country"]}
                    placeholder="Country"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
