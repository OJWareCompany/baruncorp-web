// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
// import { DepartmentControllerDeleteTerminateServiceMemberIsInChargeOfParams } from "@/api";

// const useDeleteMemberServiceMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     DepartmentControllerDeleteTerminateServiceMemberIsInChargeOfParams["serviceId"]
//   >(
//     (serviceId) => {
//       if (userId == null) {
//         return Promise.reject("userId is undefined.");
//       }

//       const params: DepartmentControllerDeleteTerminateServiceMemberIsInChargeOfParams =
//         {
//           userId,
//           serviceId,
//         };

//       return api.departments
//         .departmentControllerDeleteTerminateServiceMemberIsInChargeOf(params)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default useDeleteMemberServiceMutation;
