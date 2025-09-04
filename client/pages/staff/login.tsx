import { signIn } from "next-auth/react";
import { Button } from "@/components/button";

export default function StaffLogin({store}: {store: string}) {
    return (
        <div>
            <Button 
            name="Sign in with Google"
            className="bg-lime-600"
            onClick={() => signIn("google", {
                callbackUrl: `${window.location.origin}/staff/queueOverview?store=${store}`,
            })}
            />
        </div>
    )
}