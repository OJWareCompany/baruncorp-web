"use client";

import { DefaultValues, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Loader2, Search } from "lucide-react";
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
import useDebounce from "@/hook/useDebounce";

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
        const { errorMessage, ...addressForm } = data;

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
    trigger,
    formState: { isSubmitting },
  } = form;

  const [addressInputValue, setAddressInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { debouncedValue: debouncedAddress, isDebouncing } = useDebounce(
    addressInputValue,
    popoverOpen
  );
  const { data: addresses, isFetching } =
    useAddressSearchQuery(debouncedAddress);

  const [selectedAddress, setSelectedAddress] = useState<GeocodeFeature | null>(
    null
  );

  function onSelectAddress(address: GeocodeFeature) {
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

  function getAddressesElement() {
    if (addressInputValue === "") {
      return <div className="py-6 text-center text-sm">No address found.</div>;
    }

    if (isDebouncing || isFetching || addresses == null) {
      return <Loader2 className="my-6 mx-auto h-6 w-6 animate-spin" />;
    }

    if (addresses.length === 0) {
      return <div className="py-6 text-center text-sm">No address found.</div>;
    }

    return (
      <div className="overflow-hidden p-1">
        {addresses.map((address: GeocodeFeature) => (
          <div
            key={address.id}
            onClick={() => {
              onSelectAddress(address);
              setPopoverOpen(false);
            }}
            className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          >
            {address.place_name}
          </div>
        ))}
      </div>
    );
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
            <FormItem>
              <FormLabel required>Address</FormLabel>
              <PopoverTrigger asChild>
                <Button variant="outline" fullWidth>
                  Search for address
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 p-0"
                onPointerDownOutside={() => {
                  setAddressInputValue("");
                }}
                align="start"
              >
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <label htmlFor="search-input" />
                  <input
                    id="search-input"
                    type="text"
                    className="w-full py-3 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search for address"
                    onChange={(event) => {
                      setAddressInputValue(event.target.value);
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                  />
                </div>
                {getAddressesElement()}
              </PopoverContent>
            </FormItem>
          </Popover>

          {selectedAddress && (
            <Scene
              coordinates={[
                selectedAddress.geometry.coordinates[0],
                selectedAddress.geometry.coordinates[1],
              ]}
            />
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
                    onChange={(event) => {
                      setValue("addressForm.street1", event.target.value);
                      trigger("addressForm");
                    }}
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
                    onChange={(event) => {
                      setValue("addressForm.street2", event.target.value);
                      trigger("addressForm");
                    }}
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
                    onChange={(event) => {
                      setValue("addressForm.city", event.target.value);
                      trigger("addressForm");
                    }}
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
                    onChange={(event) => {
                      setValue("addressForm.stateOrRegion", event.target.value);
                      trigger("addressForm");
                    }}
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
                    onChange={(event) => {
                      setValue("addressForm.postalCode", event.target.value);
                      trigger("addressForm");
                    }}
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
                    onChange={(event) => {
                      setValue("addressForm.country", event.target.value);
                      trigger("addressForm");
                    }}
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
