import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingButton from "@/components/LoadingButton";
import useDeleteScopeMutation from "@/mutations/useDeleteScopeMutation";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  scopeId: string;
}

export default function PageHeaderAction({ scopeId }: Props) {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useDeleteScopeMutation(scopeId);
  const router = useRouter();
  const { toast } = useToast();

  return (
    <>
      <Button
        variant={"outline"}
        size={"sm"}
        className="text-destructive hover:text-destructive"
        onClick={() => {
          setOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isPending}
              onClick={() => {
                mutateAsync()
                  .then(() => {
                    toast({ title: "Success" });
                    router.push("/system-management/scopes");
                    setOpen(false);
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    if (
                      error.response &&
                      error.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: error.response.data.message,
                        variant: "destructive",
                      });
                      return;
                    }
                  });
              }}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
