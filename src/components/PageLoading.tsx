import { Loader2 } from "lucide-react";
import PageHeaderPlaceholder from "./PageHeaderPlaceholder";

interface Props {
  isPageHeaderPlaceholder?: boolean;
}

export default function PageLoading({ isPageHeaderPlaceholder = true }: Props) {
  return (
    <>
      {isPageHeaderPlaceholder && <PageHeaderPlaceholder />}
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
}
