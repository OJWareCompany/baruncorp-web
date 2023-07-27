import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  OrganizationsPostResDto,
  OrganizationsPostReqDto,
} from "@/types/dto/organizations";

const usePostOrganizationMutation = () => {
  const api = useApi();

  return useMutation<
    OrganizationsPostResDto,
    AxiosError<ErrorResponseData>,
    OrganizationsPostReqDto
  >((data) =>
    api
      .post<OrganizationsPostResDto>("/organizations", data)
      .then(({ data }) => data)
  );
};

export default usePostOrganizationMutation;
