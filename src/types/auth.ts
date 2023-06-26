export interface SigninReqData {
  email: string;
  password: string;
}

export interface SigninResData {
  accessToken: string;
  refreshToken: string;
}

export interface SignupReqData {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  code: string;
}
