"use client";
import { Dispatch, createContext, useContext, useReducer } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DialogData {
  modification:
    | {
        open: false;
      }
    | { open: true; value: string };
  deletion: { open: false } | { open: true; value: string };
}

type Action = {
  type: "CLOSE_DELETION";
};

function dialogDataReducer(dialogData: DialogData, action: Action): DialogData {
  switch (action.type) {
    // case "UNASSIGN": {
    //   return {
    //     open: true,
    //     ...action,
    //   };
    // }
    case "CLOSE_DELETION": {
      return {
        ...dialogData,
        deletion: {
          open: false,
        },
      };
    }
  }
}

const initialDialogData: DialogData = {
  modification: {
    open: false,
  },
  deletion: {
    open: false,
  },
};

const DialogDataDispatchContext = createContext<Dispatch<Action>>(() => {});

interface Props {
  children: React.ReactNode;
}

export default function DialogDataProvider({ children }: Props) {
  const [dialogData, dispatch] = useReducer(
    dialogDataReducer,
    initialDialogData
  );

  // const queryClient = useQueryClient();
  // const { toast } = useToast();
  // const { mutateAsync: patchJobStatusMutateAsync } =
  //   usePatchJobStatusMutation();
  // const { mutateAsync: patchJobSendMutateAsync } = usePatchJobSendMutation();
  // const { mutateAsync: patchOrderedServiceStatusMutateAsync } =
  //   usePatchOrderedServiceStatusMutation();
  // const { mutateAsync: patchAssignMutateAsync } = usePatchAssignMutation();
  // const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
  //   usePatchAssignedTaskCompleteMutation();
  // const { mutateAsync: patchAssignedTaskUnassignMutateAsync } =
  //   usePatchAssignedTaskUnassignMutation();

  return (
    <>
      <DialogDataDispatchContext.Provider value={dispatch}>
        {children}
      </DialogDataDispatchContext.Provider>
      <AlertDialog
        open={dialogData.deletion.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          dispatch({ type: "CLOSE_DELETION" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!dialogData.deletion.open) {
                  return;
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function useDialogDataDispatch() {
  return useContext(DialogDataDispatchContext);
}
