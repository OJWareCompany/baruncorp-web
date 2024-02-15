import { useQueries } from "@tanstack/react-query";
import { getUsersQueryKey } from "./useUsersQuery";
import useApi from "@/hook/useApi";
import { FindUsersHttpControllerGetFindUsersParams } from "@/api/api-spec";
import { UserStatusEnum } from "@/lib/constants";

const useExcludeInactiveUsersQuery = (organizationId: string) => {
  const api = useApi();

  return useQueries({
    queries: [
      UserStatusEnum.Values.Active,
      UserStatusEnum.Values["Invitation Sent"],
      UserStatusEnum.Values["Invitation Not Sent"],
    ].map((status) => {
      const params: FindUsersHttpControllerGetFindUsersParams = {
        organizationId,
        limit: Number.MAX_SAFE_INTEGER,
        status,
      };

      return {
        queryKey: getUsersQueryKey(params),
        queryFn: () =>
          api.users
            .findUsersHttpControllerGetFindUsers(params)
            .then(({ data }) => data),
      };
    }),
    combine: (results) => {
      return {
        data: results.some((result) => result.data == null)
          ? undefined
          : results.map((result) => result.data!.items).flat(),
        isPending: results.some((result) => result.isPending),
      };
    },
  });
};

export default useExcludeInactiveUsersQuery;
