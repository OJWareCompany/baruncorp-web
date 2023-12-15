// import { useState } from "react";
// import AhjNoteHistorySheet from "./AhjNoteHistorySheet";
// import AhjNoteHistoryTable from "./AhjNoteHistoryTable";

// interface Props {
//   geoId: string;
// }

// export default function AhjNoteHistory({ geoId }: Props) {
//   const [ahjHistorySheetState, setAhjHistorySheetState] = useState<{
//     id?: string;
//     open: boolean;
//   }>({ open: false });

//   return (
//     <>
//       <AhjNoteHistoryTable
//         geoId={geoId}
//         onRowClick={(historyId) => {
//           setAhjHistorySheetState({ open: true, id: historyId });
//         }}
//       />
//       <AhjNoteHistorySheet
//         {...ahjHistorySheetState}
//         onOpenChange={(open) => {
//           if (!open) {
//             setAhjHistorySheetState({ open });
//           }
//         }}
//       />
//     </>
//   );
// }

import React from "react";

export default function AhjNoteHistory() {
  return <div>AhjNoteHistory</div>;
}
