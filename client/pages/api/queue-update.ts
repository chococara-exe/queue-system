import { IncomingMessage } from "http";
import { NextApiRequest, NextApiHandler, NextApiResponse } from "next";
// import { WebSocket } from 'ws';

// declare global {
//     var wss: WebSocketServer | undefined;
// }

// let wss: WebSocketServer;

// if (!global.wss) {
//     global.wss = new WebSocketServer({ port: 3001, perMessageDeflate: false });

//     console.log('Websocket server started on port 3001');

//     global.wss.on('connection', (ws: any, request: IncomingMessage) => {
//         console.log('New WebSocket connection established')
//     })
// }
// wss = global.wss;

const WebSocket = require('ws');
const wss = new WebSocket.Server({port:3001});

interface QueueUpdatePayload {
    store: string;
    queue: string;
    currentNumber: number;
    waitingCount: number;
}

interface ExtendedWebSocket extends WebSocket {
    readyState: number;
    send(data: string): void;
}

wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log("Client connected")
})

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { store, queue, currentNumber, waitingCount } = req.body;

        wss.clients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === 1) {
            const payload: QueueUpdatePayload = {
                store,
                queue,
                currentNumber,
                waitingCount
            };
            client.send(JSON.stringify(payload));
            }
        });

        res.status(200).json({success: true});
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}