import React from "react";
import { ClipboardCopy } from "lucide-react";
import { Button } from "./button";
import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";

interface JobIdCopyButtonProps {
  JobId: string;
  className?: string;
}

const TextCopyButton: React.FC<JobIdCopyButtonProps> = ({
  JobId,
  className,
}) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(JobId).then(() => {
      toast({
        title: "Copy successful!",
        description: JobId,
      });
    });
  };

  return (
    <div className={(cn("relative"), className)}>
      <Button
        size={"sm"}
        variant={"outline"}
        className="-ml-3 text-xs h-8 px-2"
        onClick={(event) => {
          event.preventDefault();
          handleCopy();
        }}
      >
        <ClipboardCopy className="mr-2 h-4 w-4" />
        <span>Copy</span>
      </Button>
    </div>
  );
};

export default TextCopyButton;
