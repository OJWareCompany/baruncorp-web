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

import { LicenseTypeEnum } from "@/lib/constants";

import NewLicenseForm from "@/components/form/NewLicenseForm";
import { getLicenseQueryKey } from "@/queries/useLicenseQuery";

interface Props {
  type: LicenseTypeEnum;
  abbreviation: string;
}

export default function NewLicensedWorkerDialog({ abbreviation, type }: Props) {
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
          New Licensed Worker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Licensed Worker</DialogTitle>
        </DialogHeader>
        <NewLicenseForm
          type={type}
          abbreviation={abbreviation}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: getLicenseQueryKey({ type, abbreviation }),
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
