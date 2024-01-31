// import { useQuery } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import { StatesResponseDto } from "@/api/api-spec";

// const useStatesQuery = () => {
//   const api = useApi();

//   return useQuery<StatesResponseDto[], AxiosError<ErrorResponseData>>({
//     queryKey: ["states", "list"],
//     queryFn: () =>
//       api.departments
//         .departmentControllerGetFindAllStates()
//         .then(({ data }) => data),
//   });
// };

// export default useStatesQuery;
