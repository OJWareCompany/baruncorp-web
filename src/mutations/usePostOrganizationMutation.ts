import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateOrganizationRequestDto, IdResponse } from "@/api/api-spec";

const usePostOrganizationMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateOrganizationRequestDto
  >({
    mutationFn: (reqData) => {
      return api.organizations
        .createOrganizationHttpControllerPostCreateOrganization(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostOrganizationMutation;
