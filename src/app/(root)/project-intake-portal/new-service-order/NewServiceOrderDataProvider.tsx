import { Session } from "next-auth";
import { Dispatch, createContext, useContext, useReducer } from "react";

interface NewServiceOrderData {
  session: {
    id: string;
    organizationId: string;
  };
  isBarunCorpMember: boolean;
  organizationId: string;
  projectId: string;
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
        organizationId: action.organizationId,
        projectId: "",
      };
    }
    case "SET_PROJECT_ID": {
      return {
        ...newServiceOrderData,
        projectId: action.projectId,
      };
    }
    case "RESET": {
      return {
        ...newServiceOrderData,
        projectId: "",
      };
    }
  }
}

function getInitialNewServiceOrderData(session?: Session): NewServiceOrderData {
  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const myOrganizationId = session?.organizationId ?? "";

  const organizationId = isBarunCorpMember ? "" : myOrganizationId;

  return {
    session: {
      id: session?.id ?? "",
      organizationId: session?.organizationId ?? "",
    },
    isBarunCorpMember,
    organizationId,
    projectId: "",
  };
}

const NewServiceOrderDataContext = createContext<NewServiceOrderData>(
  getInitialNewServiceOrderData()
);
const NewServiceOrderDataDispatchContext = createContext<Dispatch<Action>>(
  () => {}
);

interface Props {
  children: React.ReactNode;
  session: Session;
}

export default function NewServiceOrderDataProvider({
  children,
  session,
}: Props) {
  const [newServiceOrderData, dispatch] = useReducer(
    newServiceOrderDataReducer,
    getInitialNewServiceOrderData(session)
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
