import { UploadCloud } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export default function Dropzone() {
  const onDrop = useCallback((acceptedFiles: any) => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "bg-muted p-12 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragActive && "ring-2 ring-ring ring-offset-2"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <UploadCloud className="w-8 h-8 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Choose files or drag and drop
        </span>
      </div>
    </div>
  );
}
