import { UploadCloud, X } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Props {
  files: File[];
  onFilesChange: (newFiles: File[]) => void;
}

export default function Dropzone({ files, onFilesChange }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files];
      for (const acceptedFile of acceptedFiles) {
        if (files.findIndex((file) => file.name === acceptedFile.name) === -1) {
          newFiles.push(acceptedFile);
        }
      }

      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col gap-2">
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
      {files.map((file) => (
        <div key={file.name} className="flex gap-2">
          <Input value={file.name} readOnly />
          <Button
            size={"icon"}
            variant={"outline"}
            onClick={() => {
              onFilesChange(files.filter((value) => value.name !== file.name));
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
