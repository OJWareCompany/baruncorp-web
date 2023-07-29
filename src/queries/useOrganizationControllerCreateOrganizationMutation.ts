import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateOrganizationRequestDto } from "@/api";

const useOrganizationControllerCreateOrganizationMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    CreateOrganizationRequestDto
  >((reqData) =>
    api.organizations
      .organizationControllerCreateOrganization(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default useOrganizationControllerCreateOrganizationMutation;
