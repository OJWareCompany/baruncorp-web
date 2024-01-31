// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
// import { CreateMemberPositionRequestDto } from "@/api/api-spec";

// const usePostMemberPositionMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     CreateMemberPositionRequestDto["positionId"]
//   >(
//     (positionId) => {
//       if (userId == null) {
//         return Promise.reject("userId is undefined.");
//       }

//       const params: CreateMemberPositionRequestDto = {
//         userId,
//         positionId,
//       };

//       return api.departments
//         .departmentControllerPostAppointPosition(params)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default usePostMemberPositionMutation;
