import axios from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    sent?: boolean;
  }
}
