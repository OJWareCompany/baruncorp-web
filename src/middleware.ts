import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return token == null ? false : true;
    },
  },
});

export const config = { matcher: ["/((?!signin|signup).*)"] };
