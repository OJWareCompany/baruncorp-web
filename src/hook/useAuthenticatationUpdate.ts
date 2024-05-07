import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/ui/use-toast";

export default function useAuthenticatationUpdate() {
  const { setAuthStatus } = useAuthStore();
  const router = useRouter();

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    return await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  };

  const logout = async () => {
    return await signOut({ redirect: false }).then(() => {
      setAuthStatus("unauthenticated");
      toast({ title: "Sign-out success" });
      router.push("/signin");
    });
  };

  const logoutOnAuthError = async () => {
    return await signOut({ redirect: false }).then(() => {
      toast({
        title: "Please sign-in again",
        variant: "destructive",
      });
      /**
       * case 1
       */
      // router.refresh();
      // router.push("/signin");
      // setAuthStatus("unauthenticated");
      /**
       * case 2
       */
      setAuthStatus("unauthenticated");
      setTimeout(() => {
        router.refresh();
        router.push("/signin");
      }, 0);
    });
  };

  return {
    login,
    logout,
    logoutOnAuthError,
  };
}
