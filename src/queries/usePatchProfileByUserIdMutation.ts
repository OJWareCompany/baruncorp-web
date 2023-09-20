// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { UpdateUserRequestDto } from "../api/index";
// import useApi from "@/hook/useApi";
// import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";

// const usePatchProfileByUserIdMutation = (userId: string | undefined) => {
//   const api = useApi();
//   const invalidate = useProfileByUserIdQueryInvalidation(userId);

//   return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
//     (data) => {
//       if (userId == null) {
//         return Promise.reject("userId is undefined.");
//       }

//       return api.users
//         .usersControllerPatchUpdateUserByUserId(userId, data)
//         .then(({ data }) => data);
//     },
//     {
//       onSuccess: () => invalidate(),
//     }
//   );
// };

// export default usePatchProfileByUserIdMutation;
