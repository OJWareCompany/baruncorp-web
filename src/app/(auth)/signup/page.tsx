"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import UserForm from "./UserForm";
import { useToast } from "@/components/ui/use-toast";
import useInvitationUserQuery from "@/queries/useInvitationUserQuery";
import { KNOWN_ERROR } from "@/lib/constants";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const userId = searchParams.get("userId");

  const {
    data: user,
    isLoading: isUserQueryLoading,
    isError: isUserQueryError,
    error: userQueryError,
  } = useInvitationUserQuery(userId ?? "");

  useEffect(() => {
    if (
      userId == null ||
      (user != null && user.status !== "Invitation Sent") ||
      isUserQueryError
    ) {
      const timeout = setTimeout(() => {
        toast({
          title:
            userQueryError?.cause?.name === KNOWN_ERROR
              ? userQueryError.cause.message
              : "Invalid access",
          variant: "destructive",
        });
        router.push("/signin");
      }, 0);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [
    isUserQueryError,
    router,
    toast,
    user,
    userId,
    userQueryError?.cause?.message,
    userQueryError?.cause?.name,
  ]);

  if (userId == null || isUserQueryLoading || user == null) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin"
          onClick={() => {
            toast({ title: "Invalid access", variant: "destructive" });
          }}
        />
      </div>
    );
  }

  return <UserForm user={user} />;
}
