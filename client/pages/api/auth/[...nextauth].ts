import { config } from "@/lib/auth";
import NextAuth, { NextAuthOptions } from "next-auth";

export default NextAuth(config);