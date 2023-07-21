"use client";

import { DefaultValues, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
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
import { useDebounceWithHandler } from "@/hook/useDebounce";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import usePostOrganizationMutation from "@/queries/usePostOrganizationMutation";
import Scene from "@/components/Scene";
import { toast } from "@/hook/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { getAddressFieldMap } from "@/lib/utils";
import { Feature } from "@/types/dto/mapbox/places";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

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
  addressForm: z
    .object({
      address: z.string(),
      street1: z.string(),
      street2: z.string(),
      city: z.string(),
      stateOrRegion: z.string(),
      postalCode: z.string(),
      country: z.string(),
      errorMessage: z.string(),
    })
    .refine(
      (data) => {
        const { street1, street2, city, stateOrRegion, postalCode, country } =
          data;
        const isError = ![
          street1,
          street2,
          city,
          stateOrRegion,
          postalCode,
          country,
        ].some((value) => value.trim() === "");
        return isError;
      },
      (data) => {
        const { errorMessage, address, ...addressForm } = data;

        let errorField = "";
        for (let field in addressForm) {
          if (
            addressForm[
              field as
                | "street1"
                | "street2"
                | "city"
                | "stateOrRegion"
                | "postalCode"
                | "country"
            ] === ""
          ) {
            errorField = field;
            break;
          }
        }

        return {
          message: `${errorField} is required`,
          path: ["errorMessage"],
        };
      }
    ),
});

type FieldValues = z.infer<typeof formSchema>;

let defaultValues: DefaultValues<FieldValues>;
if (process.env.NODE_ENV === "development") {
  defaultValues = {
    name: "tesla",
    description: "tesla go to the moon~!",
    phoneNumber: "01028541434",
    email: "ejsvk3284@kakao.com",
    addressForm: {
      address: "",
      street1: "",
      street2: "",
      city: "",
      stateOrRegion: "",
      postalCode: "",
      country: "",
      errorMessage: "",
    },
  };
}

export default function Page() {
  const router = useRouter();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting },
  } = form;

  const addressInputRef = useRef(null);
  const {
    debounced: debouncedAddress,
    onValueChange: onAddressValueChange,
    clear: clearAddressDebounced,
  } = useDebounceWithHandler();
  const { data: addresses } = useAddressSearchQuery(debouncedAddress);

  const [selectedAddress, setSelectedAddress] = useState<Feature | null>();

  const [popoverOpen, setPopoverOpen] = useState(false);

  function onSelectAddress(address: Feature) {
    setSelectedAddress(address);

    clearErrors("addressForm.errorMessage");

    const addressFieldMap = getAddressFieldMap(address);

    Object.entries(addressFieldMap).forEach(
      ([key, value]: [string, string]) => {
        const addressKey = `addressForm.${key}` as
          | "addressForm.street1"
          | "addressForm.street2"
          | "addressForm.city"
          | "addressForm.stateOrRegion"
          | "addressForm.postalCode"
          | "addressForm.country";

        setValue(addressKey, value);
      }
    );
  }

  let readOnlyOf = {
    street1: true,
    street2: true,
    city: true,
    stateOrRegion: true,
    postalCode: true,
    country: true,
  };

  if (selectedAddress != null) {
    const addressFieldMap = getAddressFieldMap(selectedAddress);

    readOnlyOf = {
      street1: addressFieldMap.street1 !== "",
      street2: false,
      city: addressFieldMap.city !== "",
      stateOrRegion: addressFieldMap.stateOrRegion !== "",
      postalCode: addressFieldMap.postalCode !== "",
      country: addressFieldMap.country !== "",
    };
  }

  const { mutateAsync } = usePostOrganizationMutation();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({ ...values, ...values.addressForm })
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
          case 409:
            title = response?.data.message[0];
            description = "";
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
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <FormField
              control={control}
              name="addressForm.address"
              render={() => (
                <FormItem>
                  <FormLabel required>Address</FormLabel>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" fullWidth>
                      Select address
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-96 p-0"
                    onPointerDownOutside={clearAddressDebounced}
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search for address"
                        ref={addressInputRef}
                        onValueChange={onAddressValueChange}
                      />
                      <CommandEmpty>No address found.</CommandEmpty>
                      <CommandGroup
                        className={`${
                          (!addresses || addresses.length === 0) && "p-0"
                        }`}
                      >
                        {addresses?.map((address: Feature) => (
                          <CommandItem
                            key={address.id}
                            onSelect={() => {
                              onSelectAddress(address);
                              setPopoverOpen(false);
                            }}
                          >
                            {address.place_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </FormItem>
              )}
            />
          </Popover>

          {selectedAddress && (
            <Scene coordinates={selectedAddress.geometry.coordinates} />
          )}

          <FormField
            control={control}
            name="addressForm.street1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["street1"]}
                    placeholder="Street1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="addressForm.street2"
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
            name="addressForm.city"
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
            name="addressForm.stateOrRegion"
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
            name="addressForm.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnlyOf["postalCode"]}
                    placeholder="Postal Code"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="addressForm.country"
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
          <FormField
            control={control}
            name="addressForm.errorMessage"
            render={() => <FormMessage />}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
