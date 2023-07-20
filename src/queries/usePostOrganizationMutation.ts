import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import {
  OrganizationsPostResDto,
  OrganizationsPostReqDto,
} from "@/types/dto/organizations";

const usePostOrganizationMutation = () => {
  const apiClient = useApiClient();

  return useMutation<
    OrganizationsPostResDto,
    AxiosError<ErrorResponseData>,
    OrganizationsPostReqDto
  >((data) =>
    apiClient
      .post<OrganizationsPostResDto>("/organizations", data)
      .then(({ data }) => data)
  );
};

export default usePostOrganizationMutation;
