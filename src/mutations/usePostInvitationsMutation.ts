// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import { CreateInvitationMailRequestDto } from "@/api";

// const usePostInvitationsMutation = () => {
//   const api = useApi();

//   return useMutation<
//     object, // TODO: replace object with proper type
//     AxiosError<ErrorResponseData>,
//     CreateInvitationMailRequestDto
//   >((reqData) =>
//     api.users
//       .usersControllerPostSendInvitationMail(reqData)
//       .then(({ data: resData }) => resData)
//   );
// };

// export default usePostInvitationsMutation;

export {};
