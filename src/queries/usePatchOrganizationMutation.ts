import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateOrganizationRequestDto } from "@/api";

const usePatchOrganizationMutation = (organizationId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateOrganizationRequestDto
  >((reqData) => {
    return api.organizations
      .updateOrganizationHttpControllerPatch(organizationId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchOrganizationMutation;
