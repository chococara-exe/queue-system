import React from "react";
import Queue from "./queueControl";
import { auth } from "@/lib/auth";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await auth(context.req, context.res);
    const store = context.query.store as string;
    return { props: {session, store} };
}

interface QueueOverviewProps {
    session: Session | null;
    store: string;
}

export default function QueueOverview({ session, store }: QueueOverviewProps) {
    return (
        <div>
            <h1>
                {session ? `Signed in as ${session.user?.name || session.user?.email} (Store: ${store})` : "Not signed in"}
            </h1>
            <Queue queue="A" store={store}/>
            <Queue queue="B" store={store}/>
            <Queue queue="C" store={store}/>
            <Queue queue="D" store={store}/>
        </div>
    )
}