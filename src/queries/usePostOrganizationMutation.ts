// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import { CreateOrganizationRequestDto } from "@/api";

// const usePostOrganizationMutation = () => {
//   const api = useApi();

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     CreateOrganizationRequestDto
//   >((reqData) =>
//     api.organizations
//       .organizationControllerPostCreateOrganization(reqData)
//       .then(({ data: resData }) => resData)
//   );
// };

// export default usePostOrganizationMutation;

export {};
