import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewLicenseForm from "@/components/form/NewLicenseForm";
import { getUserQueryKey } from "@/queries/useUserQuery";

interface Props {
  userId: string;
}

export default function NewLicenseDialog({ userId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New License
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New License</DialogTitle>
        </DialogHeader>
        <NewLicenseForm
          userId={userId}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: getUserQueryKey(userId),
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
