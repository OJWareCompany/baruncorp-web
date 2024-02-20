import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";

interface Variables {
  files: File[];
  jobNoteNumber: number; // 동근님이 데이터 타입 어떻게 만드는지 봐야함. 일단은 number로 정의
  jobNotesFolderId: string;
  jobNoteId: string;
}

interface ResponseData {
  message: string;
  data: {};
}

/**
 * 이 훅은 프론트엔드에서 바른코프 서버로 JobNote 이메일 전송 이후 파일 서버로 요청할 때 사용하는 훅이다
 * 이 코드를 테스트 해볼 수 있는 시점은 바른코프 서버를 각각 작업하고 있는 동근님 코드와 제 코드가 병합되는 시점에 가능합니다
 * 왜냐하면 프론트엔드에서 파일 서버로 요청을 보내면 파일 서버에서 바른코프 서버로 데이터 업데이트 요청을 하기 때문에 제가
 * 작성한 바른코프 서버의 코드가 동근님이 작업한 JobNote 관련 코드와 병합되어야 합니다
 */

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
const useUploadJobNoteFilesMutation = () => {
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
      formData.append("jobNoteNumber", String(variables.jobNoteNumber));
      formData.append("jobNotesFolderId", variables.jobNotesFolderId);
      formData.append("jobNoteId", variables.jobNoteId);

      const url = `${process.env.NEXT_PUBLIC_FILE_API_URL}/filesystem/jobNoteFiles`;
      return axios
        .post<ResponseData>(url, formData, {
          onUploadProgress: (axiosProgressEvent) => {
            setProgressState({
              value: (axiosProgressEvent?.progress ?? 0) * 100,
              error: false,
            });
          },
        })
        .then(() => {})
        .catch((error) => {
          setProgressState({ value: 100, error: true });
          throw error;
        });
    },
  });

  return { mutationResult, progressState };
};

export default useUploadJobNoteFilesMutation;
