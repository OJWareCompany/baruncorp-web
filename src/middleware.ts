import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  /**
   * @info
   * 해당 미들웨어는 인증 완료된 상태인 경우만 처리할 수 있다.
   * 그러므로 비로그인 상태에 대한 접근 제어 처리는 해당 컴포넌트에서 직접 해줘야 할 듯 하다.(?)
   * 예시) 비로그인 상태에서 "/" 경로에 접근하는 경우 컴포넌트에서 직접 처리해야 한다.
   */
  function middleware(req) {
    // const { pathname } = req.nextUrl;
    // const { token } = req.nextauth;
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * @info
       * authorized가 true를 반환하는 경우에만 withAuth.middleware 호출
       */
      authorized: ({ req, token }) => {
        return !!token;
      },
    },
    secret: process.env.NEXTAUTH_URL,
  }
);

/**
 * @info
 * withAuth.callbacks.authorized 콜백이 true를 리턴해야 withAuth.middleware가 호출된다.
 * withAuth.callbacks.authorized는 인증이 됐다는 의미로 token이 있는 경우에만 true를 리턴하고 있다.
 * 즉 로그인된 경우에만 withAuth.middleware가 호출되므로 비로그인 상태에서 "/"에 접근하는 경우는 처리해줄 수 없다.
 */
export const config = { matcher: ["/"] };
