"use client";
import { Building, Clock, LogOut, Palmtree, User2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
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
import { BARUNCORP_ORGANIZATION_ID } from "@/lib/constants";

export default function User() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: user, isSuccess: isProfileQuerySuccess } = useProfileQuery();
  const { data: handStatus } = useHandsStatusQuery();
  const { mutateAsync: postUserHandsDownMutateAsync } =
    usePostUserHandsDownMutation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>();

  const handleSignOutButtonClick = () => {
    if (handStatus != null && handStatus.status) {
      postUserHandsDownMutateAsync().then(() => {
        queryClient.invalidateQueries({
          queryKey: getHandsStatusQueryKey(),
        });
      });
    }

    queryClient.clear(); // 로그아웃시킬 때 cache를 지워서 다음 로그인 때 cache가 남아있지 않게 하기 위함
    signOut({ redirect: false });
    toast({ title: "Sign-out success" });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      setDate(undefined);
      clearInterval(timer);
    };
  }, [open]);

  if (!isProfileQuerySuccess) {
    return <div className="h-10 w-10 rounded-full bg-muted"></div>;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
        <DropdownMenuLabel className="font-normal flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          {date == null ? (
            <div className="h-[20px] w-[164px] animate-pulse bg-muted rounded-md" />
          ) : (
            <span>
              {formatInTimeZone(date, "America/New_York", "MM-dd-yyyy, pp")}
            </span>
          )}
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
        {user.organizationId === BARUNCORP_ORGANIZATION_ID && (
          <DropdownMenuItem asChild>
            <Link href="/my/pto">
              <Palmtree className="mr-2 h-4 w-4" />
              <span>PTO</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOutButtonClick}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
