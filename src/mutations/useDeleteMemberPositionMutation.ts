// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
// import { DepartmentControllerDeleteRevokePositionParams } from "@/api";

// const useDeleteMemberPositionMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     DepartmentControllerDeleteRevokePositionParams["positionId"]
//   >(
//     (positionId) => {
//       if (userId == null || positionId == null) {
//         return Promise.reject("userId or positionId is undefined.");
//       }

//       const params: DepartmentControllerDeleteRevokePositionParams = {
//         userId,
//         positionId,
//       };

//       return api.departments
//         .departmentControllerDeleteRevokePosition(params)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default useDeleteMemberPositionMutation;
