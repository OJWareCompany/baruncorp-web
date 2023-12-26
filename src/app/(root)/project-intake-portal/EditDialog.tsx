import { Pencil } from "lucide-react";
import ItemsContainer from "@/components/ItemsContainer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function EditDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Pencil className="w-4 h-4 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
        </DialogHeader>
        <ItemsContainer>
          <Textarea />
          <Button>Edit</Button>
        </ItemsContainer>
      </DialogContent>
    </Dialog>
  );
}
