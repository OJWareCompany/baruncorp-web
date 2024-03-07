"use client";
import { Dispatch, createContext, useContext, useReducer } from "react";
import { useSession } from "next-auth/react";
import { useProfileContext } from "../../ProfileProvider";

interface NewServiceOrderData {
  selectedOrganizationId: string;
  selectedProjectId: string;
}

type Action =
  | {
      type: "SET_ORGANIZATION_ID";
      organizationId: string;
    }
  | {
      type: "SET_PROJECT_ID";
      projectId: string;
    }
  | {
      type: "RESET";
    };

function newServiceOrderDataReducer(
  newServiceOrderData: NewServiceOrderData,
  action: Action
): NewServiceOrderData {
  switch (action.type) {
    case "SET_ORGANIZATION_ID": {
      return {
        ...newServiceOrderData,
        selectedOrganizationId: action.organizationId,
        selectedProjectId: "",
      };
    }
    case "SET_PROJECT_ID": {
      return {
        ...newServiceOrderData,
        selectedProjectId: action.projectId,
      };
    }
    case "RESET": {
      return {
        ...newServiceOrderData,
        selectedProjectId: "",
      };
    }
  }
}

const NewServiceOrderDataContext = createContext<NewServiceOrderData>({
  selectedOrganizationId: "",
  selectedProjectId: "",
});
const NewServiceOrderDataDispatchContext = createContext<Dispatch<Action>>(
  () => {}
);

interface Props {
  children: React.ReactNode;
}

export default function NewServiceOrderDataProvider({ children }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const { data: session } = useSession();
  const myOrganizationId = session?.organizationId ?? "";

  const selectedOrganizationId = isBarunCorpMember ? "" : myOrganizationId;

  const [newServiceOrderData, dispatch] = useReducer(
    newServiceOrderDataReducer,
    {
      selectedOrganizationId,
      selectedProjectId: "",
    }
  );

  return (
    <NewServiceOrderDataContext.Provider value={newServiceOrderData}>
      <NewServiceOrderDataDispatchContext.Provider value={dispatch}>
        {children}
      </NewServiceOrderDataDispatchContext.Provider>
    </NewServiceOrderDataContext.Provider>
  );
}

export function useNewServiceOrderData() {
  return useContext(NewServiceOrderDataContext);
}

export function useNewServiceOrderDataDispatch() {
  return useContext(NewServiceOrderDataDispatchContext);
}
