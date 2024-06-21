import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export const getMapboxPlacesQueryKey = (searchText: string) => [
  "mapbox.places",
  searchText,
];

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

export const fetchGeocodeFeatures = async <T = GeocodeFeature[]>(
  context: QueryFunctionContext
): Promise<T> => {
  const { queryKey } = context;
  const [_, searchText] = queryKey;
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json`,
    {
      headers: {
        Accept: "application/json",
      },
      params: {
        access_token: process.env.NEXT_PUBLIC_MAP_API_KEY,
        types: "address",
        country: "us",
      },
    }
  );
  return response.data.features as T;
};
