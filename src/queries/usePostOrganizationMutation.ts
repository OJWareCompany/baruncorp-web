import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import {
  OrganizationPostResDto,
  OrganizationPostReqDto,
} from "@/types/dto/organization";

const usePostOrganizationMutation = () => {
  const apiClient = useApiClient();

  return useMutation<
    OrganizationPostResDto,
    AxiosError<ErrorResponseData>,
    OrganizationPostReqDto
  >((data) =>
    apiClient
      .post<OrganizationPostResDto>("/organizations", data)
      .then(({ data }) => data)
  );
};

export default usePostOrganizationMutation;
