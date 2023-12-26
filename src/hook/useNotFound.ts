import { AxiosError } from "axios";
import { notFound } from "next/navigation";
import { useEffect } from "react";

export default function useNotFound(
  error: AxiosError<ErrorResponseData, any> | null
) {
  useEffect(() => {
    if (error?.response?.status === 404) {
      notFound();
    }
  }, [error?.response?.status]);
}
