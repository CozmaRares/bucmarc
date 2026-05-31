import { env } from "@/env";
import type { PageMiddleware } from "./types";

export const middleware: PageMiddleware = "no-auth";

export default function SignIn() {
    return <a href={env.CLERK_PORTAL_SIGN_IN}>Sign in through Clerk</a>;
}
