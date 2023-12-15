import { Info } from "lucide-react";
import EditDialog from "./EditDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Information() {
  return (
    <div className="relative">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription className="py-3">
          <p>
            Please send an email to{" "}
            <a href="mailto:newjobs@baruncorp.com" className="underline">
              newjobs@baruncorp.com
            </a>{" "}
            if you need to:
          </p>
          <ul className="list-disc pl-6 my-2">
            <li>Add additional services to an active service order</li>
            <li>
              Send us updated information for an active service order or for a
              service order that is on hold
            </li>
            <li>Any other questions or issues concerning service orders</li>
          </ul>
          <p>
            Please send an email to{" "}
            <a href="mailto:chrisk@baruncorp.com" className="underline">
              chrisk@baruncorp.com
            </a>{" "}
            for any matter relating to the portal.
          </p>
        </AlertDescription>
      </Alert>

      <div className="absolute top-[17px] right-[17px]">
        <EditDialog />
      </div>
    </div>
  );
}
