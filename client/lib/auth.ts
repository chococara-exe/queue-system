import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getStoreConnection } from "./mongoose"
import { StaffSchema } from "@/models/Staff"

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ], // rest of your config
callbacks: {
  async signIn({ user }) {
    console.log(user.email);
    let conn;
    try {
      conn = await getStoreConnection("10gramTrial");
    }
    catch (err) {
      console.log(err);
      return false;
    }
    const Staff = conn.model("Staff", StaffSchema);
    const staff = await Staff.findOne({email: user.email});
    // console.log(user.email);
    console.log(staff);
    return !!staff;
  },
  async jwt({ token, account, profile }) {
    // Persist the OAuth access_token and or the user id to the token right after signin
    if (account) {
      token.accessToken = account.access_token
      if (profile && (profile as any).id) {
        token.id = (profile as any).id
      }
    }
    return token
  },
  // async redirect({ url, baseUrl }) {
  //   return `${baseUrl}/staff/queueOverview`;
  // }
}
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config)
}