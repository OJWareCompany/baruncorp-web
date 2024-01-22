import React from "react";
import { Info } from "lucide-react";
import TenureTable from "./TenureTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/pto", name: "PTO" },
          { href: "/system-management/pto/policy", name: "PTO Policy" },
        ]}
      />
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>PTO Policy at Barun Corp</AlertTitle>
        <AlertDescription className="pt-2">
          <ul className="list-disc">
            <li className="py-1">
              Every member of our team is entitled to a specific amount of paid
              time off (PTO) per year, which includes vacation, medical leave,
              and any other types of leave that may require them to be away from
              work. It is the responsibility of each team member to manage their
              allocated PTO in accordance with the agreed-upon policy.
            </li>
            <li className="py-1">
              As a professional, it is important to acknowledge that unforeseen
              events may occur which may require an employee to take time off
              from work. In the event that an employee exhausts their allocated
              Paid Time Off (PTO), any additional time required shall be
              discussed with the respective managers. This discussion shall be
              centered around the possibility of taking unpaid leave. It is
              essential for employees to maintain open communication with their
              managers to ensure smooth operation of the workplace while also
              taking care of their personal needs.
            </li>
            <li className="py-1">
              In accordance with our company policies, we require a minimum of
              two weeks&apos; notice for any requests for Paid Time Off (PTO).
              We would like to emphasize that due to the nature of our business,
              we discourage sudden PTO requests. We appreciate your
              understanding and adherence to this policy, which will enable us
              to better plan and manage our resources.
            </li>
            <li className="py-1">
              As per our company&apos;s policy, new employees are entitled to
              take Paid Time Off (PTO) as soon as they join the company. The
              allocation of PTO for new employees starts from the date of their
              joining. For instance, if a new employee joins the company on
              December 1, 2022, their PTO allocation will be valid from December
              1, 2022, through December 1, 2023.
            </li>
            <li className="py-1">
              In the event of an employee&apos;s termination, whether initiated
              by the employee or employer, within the first year of employment,
              any accrued paid time off (PTO) will not be subject to
              reimbursement. However, after the completion of one year of
              service, any outstanding PTO balance will be reimbursed to the
              employee upon their departure from the company.
            </li>
            <li className="py-1">
              At the conclusion of an employee&apos;s work anniversary, any
              unused Paid Time Off (PTO) can be reimbursed. Employees are
              required to inform their manager of their remaining PTO balance to
              initiate the reimbursement process.
            </li>
            <li className="py-1 text-destructive font-medium">
              *To initiate a request for Paid Time Off (PTO), fill out the
              designated section under the &quot;Calendar&quot; tab.
              Additionally, notify your manager of your PTO request, and inform
              your team members as necessary. (TODO: fix)
            </li>
            <li className="py-1 text-destructive font-medium">
              Finally, set up an auto-reply message in your email settings to
              ensure that any correspondences received during your absence are
              addressed appropriately. (TODO: fix)
            </li>
          </ul>
        </AlertDescription>
      </Alert>
      <TenureTable />
    </div>
  );
}
