/**
 *
 * Run:
 *
 */

import { NextApiRequest, NextApiResponse } from "next";

const MailJet = require('node-mailjet')

const mailjet = new MailJet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET
})

interface MailjetResponse {
    body: any;
}

interface MailjetError {
    statusCode: number;
    message?: string;
}

export async function sendQueueEmail(
    recipientEmail: string,
    recipientName: string,
    queueLetter: string,
    queueNumber: number
): Promise<any> {
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
            From: {
                Email: process.env.SENDER_EMAIL,
                Name: '10 Pots Restaurant',
            },
            To: [
                {
                Email: recipientEmail,
                Name: recipientName,
                },
            ],
            Subject: `Your queue number for 10 Pots Restaurant is ${queueLetter}${queueNumber}`,
            TextPart: '',
            HTMLPart:
                `<h3>Dear ${recipientName}, your queue number for 10 Pots Restaurant is</h3>
                <h1><br>${queueLetter}${queueNumber}</br><h1>
                <h3>You will be notified again once your number has been called, please <br>check your inbox frequently</br> to not miss this notification.</h3>`,
            },
        ],
        })

        const result = await request as MailjetResponse;
        return result.body;
    } catch (err) {
        const error = err as MailjetError;
        console.error(`Email send error:`, error);
        throw new Error(`Failed to send email: ${error.statusCode}`);
    }
}

export async function callCustomerEmail(
    recipientEmail: string,
    recipientName: string,
    queueLetter: string,
    queueNumber: number
): Promise<any> {
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
            From: {
                Email: process.env.SENDER_EMAIL,
                Name: '10 Pots Restaurant',
            },
            To: [
                {
                Email: recipientEmail,
                Name: recipientName,
                },
            ],
            Subject: `Your queue number for 10 Pots Restaurant is being called`,
            TextPart: '',
            HTMLPart:
                `<h3>Dear ${recipientName}, your queue number ${queueLetter}${queueNumber} has been called, please make your way to the store entrance and the employee will guide you to your table.</h3>
                <h3>We hope you enjoy your meal!</h3>`,
            },
        ],
        })

        const result = await request as MailjetResponse;
        return result.body;
    } catch (err) {
        const error = err as MailjetError;
        console.error(`Email send error:`, error);
        throw new Error(`Failed to send email: ${error.statusCode}`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const {recipientEmail, recipientName, queueLetter, queueNumber} = req.body;

    try {
        const result = await sendQueueEmail(recipientEmail, recipientName, queueLetter, queueNumber);
        res.status(200).json({message: "Email sent successfully", result: result})
    } catch (error) {
        console.error("API email error:", error);
        res.status(500).json({message: "Failed to send email"})
    }
}