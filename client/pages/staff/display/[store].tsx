import React from "react";
import QueueDisplay from "@/components/display";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req } = context;
    const session = req.cookies["session"]; // or use your session cookie name

    if (!session) {
        return { redirect: { destination: "/login", permanent: false } };
    }

    const store = context.params?.store as string;

    if (!store) {
        return {notFound: true};
        console.log("store not found")
    }
    return {props: {store}};
}

interface DisplayPageProps {
    store: string;
}

export default function DisplayPage({store}: DisplayPageProps) {
    return <QueueDisplay store={store} />;
}