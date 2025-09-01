import React from "react";
import QueueDisplay from "@/components/display";
import { auth } from "@/lib/auth";
import { getServerSideProps } from "../queueOverview";

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//     const session = await auth(context.req, context.res);
    
//     if (!session) {
//         const store = context.params?.store as string;
//         return {
//             redirect: {
//                 destination: `/staff`,
//                 permanent: false
//             }
//         };
//     }

//     const sessionStore = (session as any)?.store;
//     const urlStore = context.params?.store as string;
//     const store = sessionStore || urlStore;

//     if (!store) {
//         return {notFound: true}
//     }

//     return {
//         props: { store }
//     }
// }

interface DisplayPageProps {
    store: string;
}

export default function DisplayPage({store}: DisplayPageProps) {
    return <QueueDisplay store={store} />;
}