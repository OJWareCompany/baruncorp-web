import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

interface Variables {
  files: File[];
  jobNoteNumber: number;
  jobNotesFolderId: string;
  jobNoteId: string;
}

const usePostJobNoteFilesMutation = (
  axiosRequestConfig: AxiosRequestConfig
) => {
  return useMutation<void, AxiosError<FileServerErrorResponseData>, Variables>({
    mutationFn: (variables: Variables) => {
      const formData = new FormData();
      for (const file of variables.files) {
        formData.append("files", file);
      }
      formData.append("jobNoteNumber", String(variables.jobNoteNumber));
      formData.append("jobNotesFolderId", variables.jobNotesFolderId);
      formData.append("jobNoteId", variables.jobNoteId);

      const url = `${process.env.NEXT_PUBLIC_FILE_API_URL}/filesystem/jobNoteFiles`;
      return axios.post(url, formData, axiosRequestConfig);
    },
  });
};

export default usePostJobNoteFilesMutation;
