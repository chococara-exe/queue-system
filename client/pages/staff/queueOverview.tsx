import React from "react";
import Queue from "./queueControl";
import { auth } from "@/lib/auth";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import Router, { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await auth(context.req, context.res);

    if (!session) {
        const store = context.params?.store as string;
        return {
            redirect: {
                destination: `/staff`,
                permanent: false
            }
        }
    }

    const sessionStore = (session as any)?.store;
    const queryStore = context.query.store as string;
    const store = sessionStore || queryStore || '10gramTrial';
    return { props: {session, store} };
}

interface QueueOverviewProps {
    session: Session | null;
    store: string;
}

export default function QueueOverview({ session, store }: QueueOverviewProps) {
    const router = useRouter();

    const handleSignOut = () => {
        signOut({
            callbackUrl: `/staff`
        })
    };

    async function resetAllQueues(event: React.MouseEvent<HTMLButtonElement>) {
        const response = await fetch("/api/reset", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                store: store
            })
        })

        const data = await response.json();
        
        if (!response.ok) {
            console.error(data.message);
        } else {
            router.reload();
        }
    }

    return (
        session? (
        <div>
            <h1>
                {`Signed in as ${session.user?.name || session.user?.email} (Store: ${store})`}
            </h1>
            <div>
                <button onClick={() => router.push(`/staff/display/${store}`)}>Open queue display</button>
                <button onClick={() => confirm("Are you sure you want to reset all queues and customers?")? resetAllQueues: null}>Reset all queues</button>
                <button onClick={handleSignOut}>Log out</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                <Queue queue="A" store={store}/>
                <Queue queue="B" store={store}/>
                <Queue queue="C" store={store}/>
                <Queue queue="D" store={store}/>
            </div>
        </div>
    ): (
        <div>
            <h1>Not signed in</h1>
            <p>Please go to the login page</p>
            <button onClick={() => router.push("/staff")}>Go to login</button>
        </div>
    ))
}