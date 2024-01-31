import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateAhjNoteRequestDto } from "@/api/api-spec";

const usePutAhjMutation = (geoId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateAhjNoteRequestDto
  >((reqData) => {
    return api.geography
      .geographyControllerPutUpdateNote(geoId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePutAhjMutation;
