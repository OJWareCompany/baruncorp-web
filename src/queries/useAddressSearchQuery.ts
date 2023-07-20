import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const client = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  headers: {
    Accept: "application/json",
  },
  params: {
    access_token: process.env.NEXT_PUBLIC_MAP_API_KEY,
  },
});

const useAddressSearchQuery = (address: string) => {
  return useQuery<any, AxiosError>({
    queryKey: ["mapbox.places", address],
    queryFn: async () => {
      const response = await client.get(`${address}.json`);
      return response.data.features;
    },
    enabled: address?.length >= 1,
  });
};

export default useAddressSearchQuery;
