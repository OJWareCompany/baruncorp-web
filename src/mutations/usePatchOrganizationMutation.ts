import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateOrganizationRequestDto } from "@/api/api-spec";

const usePatchOrganizationMutation = (organizationId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateOrganizationRequestDto
  >({
    mutationFn: (reqData) => {
      return api.organizations
        .updateOrganizationHttpControllerPatch(organizationId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchOrganizationMutation;
