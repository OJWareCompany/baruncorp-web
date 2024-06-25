import { useRef, useState } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import PageLoading from "../PageLoading";
import AhjNoteForm from "../form/AhjNoteForm";
import LoadingButton from "../LoadingButton";
import { toast } from "../ui/use-toast";
import { cn, convertToTitleCase } from "@/lib/utils";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
// import useNotFound from "@/hook/useNotFound";
import usePatchProjectAssociatedRegulatoryMutation from "@/mutations/usePatchProjectAssociatedRegulatoryMutation";
import { ProjectAssociatedRegulatoryBody } from "@/lib/ahj";
import { defaultErrorToast } from "@/lib/constants";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

interface NewSheetTableRowProps {
  projectId: string;
  originProjectAssociatedRegulatoryBody: ProjectAssociatedRegulatoryBody;
  geoId: string;
  className?: string;
  key: string | number;
  dataState?: string;
  closeTableSheet: () => void;
  children: React.ReactNode;
}

const NewSheetTableRow: React.FC<NewSheetTableRowProps> = ({
  projectId,
  originProjectAssociatedRegulatoryBody,
  geoId,
  className,
  key,
  dataState,
  closeTableSheet,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const changingRef = useRef(false);
  const queryClient = useQueryClient();

  const {
    data: ahjNote,
    isLoading: isAhjNoteQueryLoading,
    error: _ahjNoteQueryError,
  } = useAhjNoteQuery(open ? geoId : ""); // open된 경우만 데이터 요청

  const ahjTypeName =
    ahjNote && ahjNote.general.type
      ? convertToTitleCase(ahjNote.general.type) + " "
      : "";

  const { mutateAsync } =
    usePatchProjectAssociatedRegulatoryMutation(projectId);

  const closeSheets = () => {
    closeTableSheet();
    setOpen(false);
  };

  const changeProjectAssociatedRegulatory = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    changingRef.current = true;

    const ahjNoteType = ahjNote?.general.type;
    if (!ahjNoteType) return;

    const reqData = { ...originProjectAssociatedRegulatoryBody };

    if (ahjNoteType === "STATE") {
      reqData.stateId = geoId;
    } else if (ahjNoteType === "COUNTY") {
      reqData.countyId = geoId;
    } else if (ahjNoteType === "COUNTY SUBDIVISIONS") {
      reqData.countySubdivisionsId = geoId;
    } else if (ahjNoteType === "PLACE") {
      reqData.placeId = geoId;
    }

    mutateAsync(reqData)
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getProjectQueryKey(projectId),
        });
        closeSheets();
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        if (
          error.response &&
          error.response.data.errorCode.filter((value) => value != null)
            .length !== 0
        ) {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
          return;
        }

        toast(defaultErrorToast);
      })
      .finally(() => {
        changingRef.current = false;
      });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild type={undefined}>
        <div
          className={cn(
            "border-b last:border-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted table-row cursor-pointer",
            className
          )}
          key={key}
          data-state={dataState}
        >
          {children}
        </div>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        {isAhjNoteQueryLoading || ahjNote == null ? (
          <PageLoading />
        ) : (
          <>
            <div className="flex justify-between mt-4">
              <SheetHeader className="flex mb-6">
                <SheetTitle>{`${ahjNote.general.fullAhjName} Note`}</SheetTitle>
              </SheetHeader>
              <LoadingButton
                variant={"outline"}
                size={"sm"}
                isLoading={changingRef.current}
                className="text-white bg-slate-700"
                onClick={changeProjectAssociatedRegulatory}
              >{`Change ${ahjTypeName}Note`}</LoadingButton>
            </div>
            <AhjNoteForm ahjNote={ahjNote} geoId={geoId} disabled={true} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NewSheetTableRow;
