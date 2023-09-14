import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const useAddressSearchQuery = (
  searchText: string,
  { format }: { format: "international" | "us" }
) => {
  let country: string;
  if (format === "us") {
    country = "us";
  }

  return useQuery<GeocodeFeature[], AxiosError>({
    queryKey: ["mapbox.places", searchText],
    queryFn: async () => {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json`,
        {
          headers: {
            Accept: "application/json",
          },
          params: {
            access_token: process.env.NEXT_PUBLIC_MAP_API_KEY,
            types: "address",
            country,
          },
        }
      );
      return response.data.features;
    },
    enabled: searchText.length >= 1,
  });
};

export default useAddressSearchQuery;
