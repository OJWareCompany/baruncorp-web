import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import PageHeaderPlaceholder from "./PageHeaderPlaceholder";
import { useCommonStore } from "@/store/useCommonStore";
import useAuthenticatationUpdate from "@/hook/useAuthenticatationUpdate";

interface Props {
  isPageHeaderPlaceholder?: boolean;
}

export default function PageLoading({ isPageHeaderPlaceholder = true }: Props) {
  const { triggeredNetworkError, setTriggeredNetworkError } = useCommonStore();
  const { logout } = useAuthenticatationUpdate();

  /**
   * Loading Page 컴포넌트에서 네트워크 에러 감지 시 logout
   */
  useEffect(() => {
    // console.log(
    //   `[ON] PageLoading Component [triggeredNetworkError: ${triggeredNetworkError}]`
    // );
    if (triggeredNetworkError) {
      // console.log(`triggeredNetworkError is true, Go logout`);
      logout(false);
      setTriggeredNetworkError(false);
    }

    // return () => {
    //   console.log(
    //     `[OFF] PageLoading Component [triggeredNetworkError: ${triggeredNetworkError}]`
    //   );
    // };
  }, [triggeredNetworkError]);

  return (
    <>
      {isPageHeaderPlaceholder && <PageHeaderPlaceholder />}
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
}
