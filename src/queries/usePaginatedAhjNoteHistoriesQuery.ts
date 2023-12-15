// import { useQuery } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { PaginationState } from "@tanstack/react-table";
// import useApi from "@/hook/useApi";
// import { AhjNoteHistoryPaginatedResponseDto } from "@/api";

// interface Props {
//   geoId: string;
//   pagination: PaginationState;
//   initialData?: AhjNoteHistoryPaginatedResponseDto;
// }

// const usePaginatedAhjNoteHistoriesQuery = ({
//   geoId,
//   pagination: { pageIndex, pageSize },
//   initialData,
// }: Props) => {
//   const api = useApi();

//   return useQuery<
//     AhjNoteHistoryPaginatedResponseDto,
//     AxiosError<ErrorResponseData>
//   >({
//     queryKey: [
//       "ahj-note-histories",
//       "list",
//       { geoId },
//       { pageIndex, pageSize },
//     ],
//     queryFn: () =>
//       api.geography
//         .geographyControllerGetFindNoteUpdateHistory({
//           page: pageIndex + 1,
//           limit: pageSize,
//           geoId,
//         })
//         .then(({ data }) => data),
//     placeholderData: initialData,
//     keepPreviousData: true,
//   });
// };

// export default usePaginatedAhjNoteHistoriesQuery;
