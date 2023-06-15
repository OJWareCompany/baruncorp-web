import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  XCircle,
} from "lucide-react";

export type Payment = {
  firstName: string;
  id: string;
  amount: number;
  status: "backlog" | "todo" | "in progress" | "done" | "canceled";
  email: string;
};

export const payments: Payment[] = [
  {
    firstName: "yunwoo",
    id: "728ed52f",
    amount: 100,
    status: "backlog",
    email: "m@example.com",
  },
  {
    firstName: "elon",
    id: "489e1d42",
    amount: 125,
    status: "todo",
    email: "example@gmail.com",
  },
];

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: ArrowUpCircle,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle2,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: XCircle,
  },
];
