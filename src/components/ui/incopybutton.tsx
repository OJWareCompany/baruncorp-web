import React from "react";
import { ClipboardCopy } from "lucide-react";
import { Button } from "./button";
import { useToast } from "./use-toast";

interface JobIdCopyButtonProps {
  JobId: string;
}

const TextCopyButton: React.FC<JobIdCopyButtonProps> = ({ JobId }) => {
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
    <div>
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
