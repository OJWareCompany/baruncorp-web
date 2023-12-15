// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
// import useApi from "@/hook/useApi";
// import { CreateLicenseRequestDto } from "@/api";

// const usePostMemberLicenseMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     Omit<CreateLicenseRequestDto, "userId">
//   >(
//     (variables) => {
//       if (userId == null) {
//         return Promise.reject("userId is undefined.");
//       }

//       const data: CreateLicenseRequestDto = {
//         userId,
//         ...variables,
//       };

//       return api.users
//         .usersControllerPostRegisterMemberLicense(data)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default usePostMemberLicenseMutation;
