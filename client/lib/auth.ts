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
  async signIn({ user, account, profile, email, credentials }) {
    console.log(user.email);
    try {
      const callbackUrl = typeof account?.callbackUrl === "string" ? account.callbackUrl : '';
      const url = new URL(callbackUrl, process.env.NEXTAUTH_URL);
      const store = url.searchParams.get('store') || '10gramTrial';

      let conn;
      try {
        conn = await getStoreConnection(store);
      }
      catch (error) {
        console.error("Database connection error:", error);
        return false;
      }

      const Staff = conn.model("Staff", StaffSchema);
      const staff = await Staff.findOne({email: user.email});
      // console.log(user.email);
      console.log(staff);
      return !!staff;
    } catch (error) {
      console.error("Sign-in error:", error);
      return false;
    }
  },
  async jwt({ token, account, profile }) {
    // Persist the OAuth access_token and or the user id to the token right after signin
    if (account) {
      token.accessToken = account.access_token
      if (profile && (profile as any).id) {
        token.id = (profile as any).id
      }

      try {
        const callbackUrl = typeof account?.callbackUrl === "string" ? account.callbackUrl : '';
        if (callbackUrl) {
          const url = new URL(callbackUrl, process.env.NEXTAUTH_URL);
          const store = url.searchParams.get('store') || '10gramTrial';
        }
      } catch (error) {
        console.error("JWT callback error:", error);
        token.store = "10gramTrial";
      }
      // const url = new URL(typeof account?.callbackUrl === "string" ? account.callbackUrl : "");
      // const store = url.searchParams.get('store') || '10gramTrial';
      // token.store = store;
    }
    return token
  },
  // async redirect({ url, baseUrl }) {
  //   return `${baseUrl}/staff/queueOverview`;
  // }
  async session({ session, token }) {
    if (token.accessToken) {
      (session as any).accessToken = token.accessToken;
    }
    if (token.id) {
      (session as any).id = token.id;
    }
    if (token.store) {
      (session as any).store = token.store;
    }

    return session;
  }
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