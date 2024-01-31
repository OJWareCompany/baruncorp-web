import QueryString from "qs";
import { Api } from "./api-spec";

const api = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  paramsSerializer: (params) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([k, v]) => {
        return v !== "";
      })
    );

    return QueryString.stringify(filteredParams, { skipNulls: true });
  },
});

export default api;
