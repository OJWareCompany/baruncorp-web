"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props extends DialogProps {
  onOrderMoreButtonClick: () => void;
  onViewDetailButtonClick: () => void;
}

export default function ResultDialog({
  onOrderMoreButtonClick,
  onViewDetailButtonClick,
  ...dialogProps
}: Props) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Completed</DialogTitle>
          <DialogDescription>
            You can place more orders or go to the details page for your order
            details.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              onOrderMoreButtonClick();
            }}
          >
            Order More
          </Button>
          <Button
            onClick={() => {
              onViewDetailButtonClick();
            }}
          >
            View Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
