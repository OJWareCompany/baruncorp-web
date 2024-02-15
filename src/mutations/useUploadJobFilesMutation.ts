import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";

interface Variables {
  files: File[];
  jobFolderId: string;
}

interface ResponseData {
  message: string;
  data: {};
}

/**
 * @description
 * - progressState 상태를 해당 훅 안에 캡슐화 시켰음
 *     progressState를 캡슐화 시켜주지 않으면 이 뮤테이션을 호출하는 컴포넌트에서
 *     setProgressState 혹은 onUploadProgress 콜백을 인자로 받아야 하는데 그림이 이상하다고
 *     해당 state를 캡슐화 시켰습니다. 나중에 윤우님께서 이상하다는 판단이 든다면 원하시는데로 손보시면 될 것 같습니다
 * - catch 절에서 에러를 잡고 또 throw 하는 이유
 *     progressState는 훅 내부에서 관리하는 상태이기 때문에 에러 발생 시 progressState 데이터를
 *     원하는 상태로 업데이트 이후 에러를 외부로 전파하여 외부에서도 추가적인 핸들링을 해주기 위함
 */
const useUploadJobFilesMutation = () => {
  const [progressState, setProgressState] = useState({
    value: 0,
    error: false,
  });

  const mutationResult = useMutation<
    AxiosResponse<void> | void,
    AxiosError<FileServerErrorResponseData>,
    Variables
  >({
    mutationFn: (variables: Variables) => {
      const formData = new FormData();
      for (const file of variables.files) {
        formData.append("files", file);
      }
      formData.append("jobFolderId", variables.jobFolderId);

      const url = `${process.env.NEXT_PUBLIC_FILE_API_URL}/filesystem/jobFiles`;
      return axios
        .post<ResponseData>(url, formData, {
          onUploadProgress: (axiosProgressEvent) => {
            console.log(
              "Upload progress:",
              (axiosProgressEvent?.progress ?? 0) * 100
            );
            setProgressState({
              value: (axiosProgressEvent?.progress ?? 0) * 100,
              error: false,
            });
          },
        })
        .then(() => {
          console.log(
            "upload JobFiles to completed to file server. Upload to Google Drive still needs some time"
          );
        })
        .catch((error) => {
          setProgressState({ value: 100, error: true });
          throw error;
        });
    },
  });

  return { mutationResult, progressState };
};

export default useUploadJobFilesMutation;
