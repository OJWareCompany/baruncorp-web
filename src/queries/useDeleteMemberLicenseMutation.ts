// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
// import { UsersControllerDeleteRemoveMemberLicenseParams } from "@/api";

// const useDeleteMemberLicenseMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     Pick<
//       UsersControllerDeleteRemoveMemberLicenseParams,
//       "type" | "issuingCountryName"
//     >
//   >(
//     ({ type, issuingCountryName }) => {
//       if (userId == null) {
//         return Promise.reject("userId is undefined.");
//       }

//       const params: UsersControllerDeleteRemoveMemberLicenseParams = {
//         userId,
//         type,
//         issuingCountryName,
//       };

//       return api.users
//         .usersControllerDeleteRemoveMemberLicense(params)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default useDeleteMemberLicenseMutation;
