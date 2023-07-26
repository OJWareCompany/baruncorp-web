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
  /**
   * @description AddressForm Validation Rule
   * - AddressForm의 필드 리스트 및 우선 순위 (높은순)
   *    1. street1
   *    2. street2
   *    3. city
   *    4. stateOrRegion
   *    5. postalCode
   *    6. country
   * - AddressForm의 Validation 결과가 success 되기 위해서는 필드들(street1, street2, city, stateOrRegion, postalCode, country)이 모두 empty string이 아닌 string 이여야 한다.
   * - Create 버튼 클릭 시, 채워지지 않은 주소 필드 중 가장 우선 순위가 높은 필드의 이름을 베이스로 다음의 에러 메시지를 표시한다. "{Field} is required"
   * - 특정 필드에 대한 에러 메시지가 표시된 상황에서 어느 필드든 값을 입력할 시 자동으로 revalidation이 수행되며 에러 메시지가 업데이트(사리지거나 혹은 변경)된다.
   */
  addressForm: z.object({
    address: z.string(),
    street1: z.string().min(1, { message: "street1 is required" }),
    street2: z.string().min(1, { message: "street2 is required" }),
    city: z.string().min(1, { message: "city required" }),
    stateOrRegion: z
      .string()
      .min(1, { message: "state or region is required" }),
    postalCode: z.string().min(1, { message: "postal code is required" }),
    country: z.string().min(1, { message: "country is required" }),
  }),
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
    formState: { isSubmitting, errors },
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

  let errorMessage = "";
  if (errors.addressForm) {
    const addressForm = errors.addressForm;
    if (addressForm.street1) {
      errorMessage = addressForm.street1.message ?? "";
    } else if (addressForm.street2) {
      errorMessage = addressForm.street2.message ?? "";
    } else if (addressForm.city) {
      errorMessage = addressForm.city.message ?? "";
    } else if (addressForm.stateOrRegion) {
      errorMessage = addressForm.stateOrRegion.message ?? "";
    } else if (addressForm.postalCode) {
      errorMessage = addressForm.postalCode.message ?? "";
    } else if (addressForm.country) {
      errorMessage = addressForm.country.message ?? "";
    }
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
              </FormItem>
            )}
          />
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
