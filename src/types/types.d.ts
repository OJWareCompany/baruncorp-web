interface ErrorResponseData {
  errorCode: "10005" | "10006";
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}
