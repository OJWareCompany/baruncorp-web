interface ErrorResponseData {
  errorCode: string[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

interface FileServerErrorResponseData {
  message: string;
  statusCode: number;
  errorCode: string;
}

type PageType = "HOME" | "WORKSPACE" | "SYSTEM_MANAGEMENT";
