import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function useSearchParamsState(searchParamName: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get(searchParamName);

  const [state, setState] = useState(searchParam ?? "");

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams.toString());
    if (state === "") {
      urlSearchParams.delete(searchParamName);
    } else {
      urlSearchParams.set(searchParamName, state);
    }
    console.log(
      "🚀 ~ file: useSearchParamsState.ts:14 ~ useEffect ~ urlSearchParams:",
      urlSearchParams.toString()
    );

    router.replace(`${pathname}?${urlSearchParams.toString()}`);
  }, [pathname, router, searchParamName, searchParams, state]);

  return [state, setState] as const;
}
