// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";

// const usePatchOrderedServiceCancelMutation = (orderedServiceId: string) => {
//   const api = useApi();

//   return useMutation<void, AxiosError<ErrorResponseData>>(() => {
//     return api.orderedServices
//       .cancelOrderedServiceHttpControllerPatch(orderedServiceId)
//       .then(({ data: resData }) => resData);
//   });
// };

// export default usePatchOrderedServiceCancelMutation;

export {};
