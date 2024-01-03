import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";
import { KNOWN_ERROR } from "@/lib/constants";

export const getInvitationUserQueryKey = (userId: string) => [
  "invitation-users",
  "detail",
  userId,
];

const useInvitationUserQuery = (userId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getInvitationUserQueryKey(userId),
    queryFn: () =>
      api.users
        .checkInvitedUserHttpControllerGet(userId)
        .then(({ data }) => data)
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 409:
              if (error.response?.data.errorCode.includes("10017")) {
                error.cause = {
                  name: KNOWN_ERROR,
                  message: "User already exists",
                };
              }
              break;
          }
          throw error;
        }),
    enabled: userId !== "",
  });
};

export default useInvitationUserQuery;
