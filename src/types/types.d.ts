interface ErrorResponseData {
  errorCode: string[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

interface FileServerErrorResponseData {
  message: string;
  errorCode: string;
}

type InvoiceDetailPageType = "INVOICES" | "SYSTEM_MANAGEMENT";
type JobDetailPageType = "HOME" | "WORKSPACE" | "SYSTEM_MANAGEMENT";
type UserDetailPageType =
  | "MY_PROFILE"
  | "MY_ORGANIZATION"
  | "SYSTEM_MANAGEMENT";
