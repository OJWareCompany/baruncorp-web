"use client";
import { Plus } from "lucide-react";
import ExpensePricingForm from "./ExpensePricingForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function NewExpensePricingSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Expense Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Expense Pricing</SheetTitle>
        </SheetHeader>
        <ExpensePricingForm />
      </SheetContent>
    </Sheet>
  );
}
