import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

interface Variables {
  files: File[];
  jobFolderId: string;
}

const usePostJobFilesMutation = (axiosRequestConfig: AxiosRequestConfig) => {
  return useMutation<void, AxiosError<FileServerErrorResponseData>, Variables>({
    mutationFn: (variables: Variables) => {
      const formData = new FormData();
      for (const file of variables.files) {
        formData.append("files", file);
      }
      formData.append("jobFolderId", variables.jobFolderId);

      const url = `${process.env.NEXT_PUBLIC_FILE_API_URL}/filesystem/jobFiles`;
      return axios.post(url, formData, axiosRequestConfig);
    },
  });
};

export default usePostJobFilesMutation;
