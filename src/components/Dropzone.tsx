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
  // const [progress, setProgress] = useState(0);
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
    <>
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
      {/* <button
        type="button"
        onClick={() => {
          const formData = new FormData();
          for (const file of droppedFiles) {
            formData.append("files", file);
          }

          axios
            .post(
              "http://211.107.90.2:3001/filesystem/123/1234/files",
              formData,
              {
                onUploadProgress: (axiosProgressEvent) => {
                  setProgress((axiosProgressEvent?.progress ?? 0) * 100);
                },
              }
            )
            .then((a) => {
              console.log("a", a);
            })
            .catch((b) => {
              console.log("b", b);
            });
          //   axios
          //     .postForm("http://211.107.90.2:3001/filesystem/123/123/files", {
          //       file: acceptedFiles, // FileList will be unwrapped as sepate fields
          //     })
          //     .then((a) => {
          //       console.log("a", a);
          //     })
          //     .catch((b) => {
          //       console.log("b", b);
          //     });
        }}
      >
        click
      </button>
      <Progress value={progress} /> */}
    </>
  );
}
