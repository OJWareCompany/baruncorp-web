// import { useQuery } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import { UserResponseDto } from "@/api";

// export const QUERY_KEY = "users";

// const useUsersQuery = () => {
//   const api = useApi();

//   return useQuery<UserResponseDto[], AxiosError<ErrorResponseData>>({
//     queryKey: [QUERY_KEY],
//     queryFn: () =>
//       api.users.usersControllerGetFindUsers({}).then(({ data }) => data),
//   });
// };

// export default useUsersQuery;

export {};
