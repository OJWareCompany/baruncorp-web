export interface SigninPostReqDto {
  email: string;
  password: string;
}

export interface SigninPostResDto {
  accessToken: string;
  refreshToken: string;
}

export interface SignupPostReqDto {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  code: string;
}

export interface RefreshGetResDto {
  accessToken: string;
}
