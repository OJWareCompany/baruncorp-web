// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import useApi from "@/hook/useApi";
// import { UpdateAssignedTaskRequestDto } from "@/api";

// const usePatchAssignedTaskMutation = (assignedTaskId: string) => {
//   const api = useApi();

//   return useMutation<
//     void,
//     AxiosError<ErrorResponseData>,
//     UpdateAssignedTaskRequestDto
//   >((reqData) => {
//     return api.assignedTasks
//       .updateAssignedTaskHttpControllerPatch(assignedTaskId, reqData)
//       .then(({ data: resData }) => resData);
//   });
// };

// export default usePatchAssignedTaskMutation;

export {};
