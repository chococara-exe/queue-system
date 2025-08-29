import { signIn } from "next-auth/react";

export default function StaffLogin({store}: {store: string}) {
    return (
        <div>
            <button onClick={() => signIn("google", {
                callbackUrl: `${window.location.origin}/staff/queueOverview?store=${store}`,
            })}>Sign in with Google</button>
        </div>
    )
}