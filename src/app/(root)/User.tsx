"use client";
import { Building, LogOut, User2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import useProfileQuery from "@/queries/useProfileQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useHandsStatusQuery, {
  getHandsStatusQueryKey,
} from "@/queries/useHandsStatusQuery";
import usePostUserHandsDownMutation from "@/mutations/usePostUserHandsDownMutation";

export default function User() {
  const { toast } = useToast();
  const { data: user, isSuccess: isProfileQuerySuccess } = useProfileQuery();
  const { data: handStatus } = useHandsStatusQuery();
  const { mutateAsync: postUserHandsDownMutateAsync } =
    usePostUserHandsDownMutation();
  const queryClient = useQueryClient();

  const handleSignOutButtonClick = () => {
    if (handStatus != null && handStatus.status) {
      postUserHandsDownMutateAsync().then(() => {
        queryClient.invalidateQueries({
          queryKey: getHandsStatusQueryKey(),
        });
      });
    }

    signOut({ redirect: false });
    toast({ title: "Sign-out success" });
  };

  if (!isProfileQuerySuccess) {
    return <div className="h-10 w-10 rounded-full bg-muted"></div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <span className="animate-in fade-in">
                {user.fullName.slice(0, 2)}
              </span>
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="sm">{user.fullName}</span>
            <span className="text-xs leading-none text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my/profile">
            <User2 className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my/organization">
            <Building className="mr-2 h-4 w-4" />
            <span>Organization</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOutButtonClick}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
